
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from database import conectar

router = APIRouter()


class Senioridade(BaseModel):
    nome: str


@router.get("/senioridade")
def listar_senioridades():
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute("SELECT * FROM senioridade")
    resultado = cursor.fetchall()

    cursor.close()
    conexao.close()

    return resultado


@router.get("/senioridade/{id}")
def buscar_senioridade(id: int):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM senioridade WHERE idsenioridade = %s",
        (id,)
    )
    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()

    if resultado is None:
        raise HTTPException(status_code=404, detail="Senioridade não encontrada")

    return resultado


@router.post("/senioridade")
def cadastrar_senioridade(senioridade: Senioridade):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        "INSERT INTO senioridade (nome) VALUES (%s)",
        (senioridade.nome,)
    )
    conexao.commit()

    novo_id = cursor.lastrowid

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Senioridade cadastrada com sucesso",
        "idsenioridade": novo_id
    }


@router.put("/senioridade/{id}")
def atualizar_senioridade(id: int, senioridade: Senioridade):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        "UPDATE senioridade SET nome = %s WHERE idsenioridade = %s",
        (senioridade.nome, id)
    )
    conexao.commit()
    linhas = cursor.rowcount

    cursor.close()
    conexao.close()

    if linhas == 0:
        raise HTTPException(status_code=404, detail="Senioridade não encontrada")

    return {"mensagem": "Senioridade atualizada com sucesso"}


@router.delete("/senioridade/{id}")
def excluir_senioridade(id: int):
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            "DELETE FROM senioridade WHERE idsenioridade = %s",
            (id,)
        )
        conexao.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Senioridade não encontrada"
            )

        return {"mensagem": "Senioridade excluída com sucesso"}

    except HTTPException:
        conexao.rollback()
        raise

    except Exception:
        conexao.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não é possível excluir uma senioridade que possui tatuadores vinculados"
        )

    finally:
        cursor.close()
        conexao.close()