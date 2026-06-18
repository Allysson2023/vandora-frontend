import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./EditarLoja.css";

function EditarLoja(){

    const { id } = useParams();

    const navigate = useNavigate();

    const [loja, setLoja] = useState(null);

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {

    const token = localStorage.getItem("token");

    fetch(`${import.meta.env.VITE_API_URL}/api/stores/${id}`, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
    .then(res => {

        if (!res.ok) {
            throw new Error("Erro ao buscar loja");
        }

        return res.json();
    })
    .then(data => {

        console.log(data);

        setLoja(data);

    })
    .catch(err => {

        console.log(err);

    });

}, [id]);

    if(!loja){
        return <p>Carregando...</p>;
    }

    const confirmarAtualizacao = async () => {
  const token = localStorage.getItem("token");

  const payload = {
    nome: loja.nome,
    descricao: loja.descricao,
    horario_abertura: loja.horario_abertura,
    horario_fechamento: loja.horario_fechamento,
    facebook: loja.facebook,
    instagram: loja.instagram,
    meta_mensal: loja.meta_mensal
  };
  console.log(payload);
  

  const res = await fetch(`${import.meta.env.VITE_API_URL}/api/stores/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    alert("Erro ao salvar");
    return;
  }
};

    return(

        <div className="edit-loja-page">

            <button
                className="btn-back"
                onClick={() => navigate(-1)}
            >
                ← Voltar
            </button> 

            <div className="edit-loja-card">

                <h1>Editar Loja</h1>

                <div className="form-group">

                    <label>Nome da Loja</label>

                    <input
                        value={loja.nome || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                nome: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Descrição</label>

                    <textarea
                        value={loja.descricao || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                descricao: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Horário Abertura</label>

                    <input
                        type="time"
                        value={loja.horario_abertura || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                horario_abertura: e.target.value
                            })
                        }
                    />

                </div>

                <div className="form-group">

                    <label>Horário Fechamento</label>

                    <input
                        type="time"
                        value={loja.horario_fechamento || ""}
                        onChange={(e) =>
                            setLoja({
                                ...loja,
                                horario_fechamento: e.target.value
                            })
                        }
                    />

                </div>
                <div className="form-group">
  <label>Facebook (link)</label>
  <input
    value={loja.facebook || ""}
    onChange={(e) =>
      setLoja({
        ...loja,
        facebook: e.target.value
      })
    }
    placeholder="https://facebook.com/sua-loja"
  />
</div>

<div className="form-group">
  <label>Instagram (link)</label>
  <input
    value={loja.instagram || ""}
    onChange={(e) =>
      setLoja({
        ...loja,
        instagram: e.target.value
      })
    }
    placeholder="https://instagram.com/sua-loja"
  />
</div>


<div className="form-group">

  <label>Meta Mensal (R$)</label>

  <input
    type="number"
    min="0"
    value={loja.meta_mensal || ""}
    onChange={(e) =>
      setLoja({
        ...loja,
        meta_mensal: e.target.value
      })
    }
    placeholder="Ex: 50000"
  />

</div>



                <button onClick={() => setShowModal(true)}>
  Atualizar Loja
</button>

            </div>

            {showModal && (
  <div className="modal-overlay">
    <div className="modal-box">

      <h2>Confirmar atualização</h2>
      <p>Tem certeza que deseja atualizar o perfil da sua loja?</p>

      <div className="modal-actions">

        <button
          className="btn-cancel"
          onClick={() => setShowModal(false)}
        >
          Cancelar
        </button>

        <button
          className="btn-confirm"
          onClick={async () => {
            await confirmarAtualizacao();
            setShowModal(false);
          }}
        >
          Sim, atualizar
        </button>

      </div>

    </div>
  </div>
)}

        </div>

    );

}

export default EditarLoja;