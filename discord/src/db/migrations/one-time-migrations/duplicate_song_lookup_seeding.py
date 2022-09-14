from os import getenv

import psycopg2

DB_USER = getenv("DB_USER")
DB_PASS = getenv("DB_PASS")
DB_PORT = getenv("DB_PORT")
DB_NAME = getenv("DB_NAME")
DB_HOST = getenv("DB_HOST")

if None in [DB_USER, DB_PASS, DB_PORT, DB_NAME, DB_HOST]:
    print("Missing database credentials")
    exit(1)


def main():
    conn = psycopg2.connect(
        dbname=DB_NAME,
        user=DB_USER,
        password=DB_PASS,
        host=DB_HOST
    )

    cur = conn.cursor()

    cur.close()
    conn.rollback()
    # or conn.commit()
    conn.close()


if __name__ == '__main__':
    main()
