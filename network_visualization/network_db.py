from dotenv import load_dotenv
import psycopg2
import os


load_dotenv(dotenv_path="../.env")
db_user = os.getenv("DB_USER")
db_pass = os.getenv("DB_PASS")
db_name = os.getenv("DB_NAME")


def clear_network_tables():
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute(f"""DELETE * from edges""")
    cur.execute(f"""DELETE * from nodes""")

    con.commit()
    cur.close()
    con.close()


def edge_db_insert(source, target, weight):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute(f"""INSERT INTO edges (source, target, weight) VALUES ('{source}', '{target}', {weight})""")

    con.commit()
    cur.close()
    con.close()


def node_db_insert(id, label, url):
    con = psycopg2.connect(
        database=db_name,
        user=db_user,
        password=db_pass,
        port=5432)

    cur = con.cursor()

    cur.execute(f"""INSERT INTO edges (id, label, url) VALUES ('{id}', '{label}', {url})""")

    con.commit()
    cur.close()
    con.close()


if __name__ == "__main__":
    print(db_name)
