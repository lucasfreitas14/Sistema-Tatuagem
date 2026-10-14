
from fastapi import APIRouter
from pydantic import BaseModel
from database import conectar

router = APIRouter()


class Estilo(BaseModel):
    descricao: str


@router.get("")
def listar_estilos():
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM estilo")
    estilos = cursor.fetchall()
    conn.close()
    return estilos


@router.get("/{id}")
def buscar_estilo(id: int):
    conn = conectar()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM estilo WHERE idestilo = %s", (id,))
    estilo = cursor.fetchone()
    conn.close()

    if not estilo:
        return {"erro": "Estilo não encontrado"}

    return estilo


@router.post("")
def criar_estilo(estilo: Estilo):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO estilo (descricao) VALUES (%s)",
        (estilo.descricao,)
    )
    conn.commit()
    conn.close()
    return {"mensagem": "Estilo cadastrado com sucesso"}


@router.put("/{id}")
def atualizar_estilo(id: int, estilo: Estilo):
    conn = conectar()
    cursor = conn.cursor()
    cursor.execute(
        "UPDATE estilo SET descricao=%s WHERE idestilo=%s",
        (estilo.descricao, id)
    )
    conn.commit()
    conn.close()
    return {"mensagem": "Estilo atualizado com sucesso"}


@router.delete("/{id}")
def deletar_estilo(id: int):
    conn = conectar()
    cursor = conn.cursor()

    try:
        cursor.execute(
            "DELETE FROM estilo WHERE idestilo = %s",
            (id,)
        )
        conn.commit()
        conn.close()
        return {"mensagem": "Estilo deletado com sucesso"}

    except Exception:
        conn.rollback()
        conn.close()
        return {
            "erro": "Não foi possível excluir este estilo. Verifique se algum tatuador já foi marcado com ele."
        }