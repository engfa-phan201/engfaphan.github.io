import slqlite3
DB_NAME="portfolio.db"
def get_connection():
    conn= slqlite3.connect(DB_NAME)
    conn.row_factory=slqlite3.Row
    return conn
def init_db():
    conn=get_connection()
    conn.execute("""CREATE TABLE IF NOT EXISTS comment(
            id         INTERGER PRIMARY KEY AUTOINCREMENT,
            name       Text NOT NULL
            message     TEXT NOT NULL
            timesmap    DATATIME DEFAULT CURRENT_TIMESTAMP,
            ip          TEXT
            )    
            """)
    conn.commit()
    conn.close()
    