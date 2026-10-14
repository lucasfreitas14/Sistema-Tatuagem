
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from database import conectar

router = APIRouter()


class Tatuador(BaseModel):
    nometatuador: str
    cpf: str
    email: Optional[str] = None
    telefone: Optional[str] = None
    datacontratacao: Optional[str] = None
    idsenioridade: int

class EstilosDoTatuador(BaseModel):
    idestilos: List[int]



@router.get("")
def listar_tatuadores():
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute("""
        SELECT
            tatuador.*,
            senioridade.nome AS senioridade,
            GROUP_CONCAT(estilo.descricao SEPARATOR ', ') AS estilos
        FROM tatuador
        JOIN senioridade
            ON tatuador.idsenioridade = senioridade.idsenioridade
        LEFT JOIN tatuador_estilo
            ON tatuador.idtatuador = tatuador_estilo.idtatuador
        LEFT JOIN estilo
            ON tatuador_estilo.idestilo = estilo.idestilo
        GROUP BY tatuador.idtatuador
    """)

    resultado = cursor.fetchall()

    cursor.close()
    conexao.close()

    return resultado

@router.get("/{id}")
def buscar_tatuador(id: int):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute(
        "SELECT * FROM tatuador WHERE idtatuador = %s",
        (id,)
    )
    resultado = cursor.fetchone()

    cursor.close()
    conexao.close()

    if resultado is None:
        raise HTTPException(status_code=404, detail="Tatuador não encontrado")

    return resultado


@router.post("")
def cadastrar_tatuador(tatuador: Tatuador):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute("""
        INSERT INTO tatuador
        (nometatuador, cpf, email, telefone, datacontratacao, idsenioridade)
        VALUES (%s, %s, %s, %s, %s, %s)
    """, (
        tatuador.nometatuador,
        tatuador.cpf,
        tatuador.email,
        tatuador.telefone,
        tatuador.datacontratacao,
        tatuador.idsenioridade
    ))

    novo_id = cursor.lastrowid
    conexao.commit()

    cursor.close()
    conexao.close()

    return {
        "mensagem": "Tatuador cadastrado com sucesso",
        "idtatuador": novo_id
    }



@router.put("/{id}")
def atualizar_tatuador(id: int, tatuador: Tatuador):
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        # Confere se o tatuador existe
        cursor.execute(
            "SELECT idtatuador FROM tatuador WHERE idtatuador = %s",
            (id,)
        )

        if cursor.fetchone() is None:
            raise HTTPException(
                status_code=404,
                detail="Tatuador não encontrado"
            )

        # Atualiza os dados
        cursor.execute("""
            UPDATE tatuador
            SET nometatuador = %s,
                cpf = %s,
                email = %s,
                telefone = %s,
                datacontratacao = %s,
                idsenioridade = %s
            WHERE idtatuador = %s
        """, (
            tatuador.nometatuador,
            tatuador.cpf,
            tatuador.email,
            tatuador.telefone,
            tatuador.datacontratacao,
            tatuador.idsenioridade,
            id
        ))

        conexao.commit()

        return {"mensagem": "Tatuador atualizado com sucesso"}

    except HTTPException:
        conexao.rollback()
        raise

    except Exception:
        conexao.rollback()
        raise

    finally:
        cursor.close()
        conexao.close()


    return {"mensagem": "Tatuador atualizado com sucesso"}


@router.delete("/{id}")
def excluir_tatuador(id: int):
    conexao = conectar()
    cursor = conexao.cursor()

    try:
        cursor.execute(
            "DELETE FROM tatuador WHERE idtatuador = %s",
            (id,)
        )
        conexao.commit()

        if cursor.rowcount == 0:
            raise HTTPException(
                status_code=404,
                detail="Tatuador não encontrado"
            )

        return {"mensagem": "Tatuador excluído com sucesso"}

    except HTTPException:
        conexao.rollback()
        raise

    except Exception:
        conexao.rollback()
        raise HTTPException(
            status_code=400,
            detail="Não foi possível excluir o tatuador."
        )

    finally:
        cursor.close()
        conexao.close()

@router.get("/{id}/estilos")
def listar_estilos_tatuador(id: int):
    conexao = conectar()
    cursor = conexao.cursor(dictionary=True)

    cursor.execute("""
        SELECT e.idestilo, e.descricao
        FROM tatuador_estilo te
        JOIN estilo e ON te.idestilo = e.idestilo
        WHERE te.idtatuador = %s
    """, (id,))

    estilos = cursor.fetchall()

    cursor.close()
    conexao.close()

    return estilos

@router.put("/{id}/estilos")
def atualizar_estilos_tatuador(id: int, dados: EstilosDoTatuador):
    conexao = conectar()
    cursor = conexao.cursor()

    cursor.execute(
        "DELETE FROM tatuador_estilo WHERE idtatuador = %s",
        (id,)
    )

    for idestilo in dados.idestilos:
        cursor.execute("""
            INSERT INTO tatuador_estilo (idtatuador, idestilo)
VALUES (%s, %s)
        """, (id, idestilo))

    conexao.commit()
    cursor.close()
    conexao.close()

    return {"mensagem": "Estilos do tatuador atualizados com sucesso"}