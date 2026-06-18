import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./StoreComentarios.css";

function StoreComentarios() {

    const { id } = useParams();
    const navigate = useNavigate();
const [souDonoDaLoja, setSouDonoDaLoja] = useState(false);
    const [avaliacoesLoja, setAvaliacoesLoja] = useState([]);

    const [resumoAvaliacoes, setResumoAvaliacoes] = useState({
    media: 0,
    total: 0
});

const user = JSON.parse(
    localStorage.getItem("user")
);

const tipoUsuario = user?.tipo;


const [respostas, setRespostas] = useState({});

    useEffect(() => {

        fetch(`${import.meta.env.VITE_API_URL}/api/stores/${id}/comentarios`)
            .then(res => res.json())
            .then(data => {

                if (Array.isArray(data)) {
                    setAvaliacoesLoja(data);
                }

            })
            .catch(err => console.log(err));

    }, [id]);

    useEffect(() => {

    fetch(`${import.meta.env.VITE_API_URL}/api/stores/${id}/avaliacoes`)
        .then(res => res.json())
        .then(data => {
            setResumoAvaliacoes(data);
        })
        .catch(err => console.log(err));

}, [id]);

useEffect(() => {

    const token = localStorage.getItem("token");

    fetch(
        `${import.meta.env.VITE_API_URL}/api/stores/${id}`,
        {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }
    )
    .then(res => {
        if (res.ok) {
            setSouDonoDaLoja(true);
        } else {
            setSouDonoDaLoja(false);
        }
    })
    .catch(() => {
        setSouDonoDaLoja(false);
    });

}, [id]);


    const formatarData = (data) => {

        return new Date(data).toLocaleDateString("pt-BR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric"
        });

    };

const responderComentario = async (avaliacaoId) => {

    const token =
        localStorage.getItem("token");

    try {

        const resposta =
            respostas[avaliacaoId];

        if (!resposta?.trim()) {
            return;
        }

        const res = await fetch(
            `${import.meta.env.VITE_API_URL}/api/avaliacoes/${avaliacaoId}/responder`,
            {
                method: "POST",
                headers: {
                    "Content-Type":
                        "application/json",
                    Authorization:
                        `Bearer ${token}`
                },
                body: JSON.stringify({
                    resposta
                })
            }
        );

        const data =
            await res.json();

        if (!res.ok) {
            alert(data.message);
            return;
        }

        alert("Resposta enviada!");

        setAvaliacoesLoja(prev =>
            prev.map(item =>
                item.id === avaliacaoId
                    ? {
                          ...item,
                          resposta_loja: resposta
                      }
                    : item
            )
        );

    } catch (err) {
        console.log(err);
    }

};




    return (
        <div className="storeReviewsPage">

            <div className="storeReviewsHeader">

                <button
                    className="storeReviewsBackBtn"
                    onClick={() => navigate(-1)}
                >
                    ← Voltar
                </button>

                <div>
                    <h1 className="storeReviewsTitle">
                        Avaliações da Loja
                    </h1>

                    <p className="storeReviewsSubtitle">
                        Veja a opinião dos clientes
                    </p>
                </div>

            </div>

            <div className="storeReviewsSummary">

    <div className="storeReviewsScore">
        ⭐ {resumoAvaliacoes.media}
    </div>

    <div className="storeReviewsTotal">

        {resumoAvaliacoes.total}

        {resumoAvaliacoes.total === 1
            ? " avaliação"
            : " avaliações"}

    </div>

</div>

            {avaliacoesLoja.length === 0 ? (

                <div className="storeReviewsEmpty">

                    <div className="storeReviewsEmptyIcon">
                        ⭐
                    </div>

                    <h2>Nenhuma avaliação ainda</h2>

                    <p>
                        Esta loja ainda não recebeu avaliações.
                    </p>

                </div>

            ) : (

                <div className="storeReviewsList">

                    {avaliacoesLoja.map(avaliacao => (

                        <div
                            key={avaliacao.id}
                            className="storeReviewCard"
                        >

                            <div className="storeReviewTop">

                                <div>

                                    <h3 className="storeReviewUser">
                                        {avaliacao.username}
                                    </h3>

                                    <span className="storeReviewDate">
                                        {formatarData(avaliacao.created_at)}
                                    </span>

                                </div>

                                <div className="storeReviewStars">

                                    {"⭐".repeat(avaliacao.nota)}

                                </div>

                            </div>

                            <div className="storeReviewComment">

                                {avaliacao.comentario || "Sem comentário"}

                            </div>

                            {avaliacao.resposta_loja ? (

    <div className="storeReplyBox">

        <strong>
            Resposta da loja
        </strong>

        <p>
            {avaliacao.resposta_loja}
        </p>

    </div> 

) : (

    souDonoDaLoja && (

        <div className="storeReplyForm">

            <textarea
                placeholder="Responder cliente..."
                value={
                    respostas[avaliacao.id] || ""
                }
                onChange={(e) =>
                    setRespostas({
                        ...respostas,
                        [avaliacao.id]:
                            e.target.value
                    })
                }
            />

            <button
                onClick={() =>
                    responderComentario(
                        avaliacao.id
                    )
                }
            >
                Responder
            </button>

        </div>

    )

)}

                        </div>

                    ))}

                </div>

            )}

        </div>
    );
}

export default StoreComentarios;