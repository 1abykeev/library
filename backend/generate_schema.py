"""Generate a database schema diagram using graphviz."""
import graphviz

dot = graphviz.Digraph(
    "library_schema",
    comment="Library DB Schema",
    graph_attr={"rankdir": "LR", "splines": "ortho", "fontname": "Helvetica"},
    node_attr={"shape": "none", "fontname": "Helvetica", "fontsize": "11"},
    edge_attr={"fontname": "Helvetica", "fontsize": "10"},
)

tables = {
    "users": [
        ("id", "INTEGER PK"),
        ("full_name", "VARCHAR(100)"),
        ("email", "VARCHAR(255) UNIQUE"),
        ("password_hash", "TEXT"),
        ("role", "VARCHAR(20)"),
        ("created_at", "TIMESTAMP"),
    ],
    "categories": [
        ("id", "INTEGER PK"),
        ("name", "VARCHAR(100) UNIQUE"),
        ("slug", "VARCHAR(120) UNIQUE"),
    ],
    "books": [
        ("id", "INTEGER PK"),
        ("title", "VARCHAR(255)"),
        ("author", "VARCHAR(255)"),
        ("published_year", "INTEGER"),
        ("description", "TEXT"),
        ("cover_url", "VARCHAR(500)"),
        ("pdf_url", "VARCHAR(500)"),
        ("available", "BOOLEAN"),
        ("category_id", "INTEGER FK → categories"),
        ("created_at", "TIMESTAMP"),
    ],
    "borrows": [
        ("id", "INTEGER PK"),
        ("user_id", "INTEGER FK → users (nullable)"),
        ("book_id", "INTEGER FK → books"),
        ("borrow_date", "TIMESTAMP"),
        ("return_date", "TIMESTAMP (nullable)"),
        ("borrower_name", "VARCHAR(100)"),
        ("borrower_surname", "VARCHAR(100)"),
        ("borrower_phone", "VARCHAR(40)"),
        ("borrower_email", "VARCHAR(255)"),
        ("borrower_passport", "VARCHAR(40)"),
        ("note", "TEXT"),
        ("rating", "INTEGER (1-5, nullable)"),
        ("review", "TEXT (nullable)"),
    ],
}

HEADER_BG = "#4F81BD"
ROW_BG = "#DCE6F1"
ALT_BG = "#FFFFFF"
BORDER = "#2E4A7A"

for table, columns in tables.items():
    rows = ""
    for i, (col, typ) in enumerate(columns):
        bg = ROW_BG if i % 2 == 0 else ALT_BG
        bold_open = "<b>" if col == "id" else ""
        bold_close = "</b>" if col == "id" else ""
        rows += (
            f'<TR><TD ALIGN="LEFT" BGCOLOR="{bg}">'
            f"{bold_open}{col}{bold_close}"
            f'</TD><TD ALIGN="LEFT" BGCOLOR="{bg}">'
            f'<FONT COLOR="#555555">{typ}</FONT>'
            f"</TD></TR>"
        )

    label = (
        f'<<TABLE BORDER="1" CELLBORDER="0" CELLSPACING="0" COLOR="{BORDER}">'
        f'<TR><TD COLSPAN="2" BGCOLOR="{HEADER_BG}">'
        f'<FONT COLOR="white"><B>{table.upper()}</B></FONT>'
        f"</TD></TR>"
        f"{rows}"
        f"</TABLE>>"
    )
    dot.node(table, label=label)

dot.edge("books", "categories", label="category_id", arrowhead="crow", arrowtail="none", dir="back")
dot.edge("borrows", "books", label="book_id", arrowhead="crow", arrowtail="none", dir="back")
dot.edge("borrows", "users", label="user_id (opt)", arrowhead="crow", arrowtail="none", dir="back", style="dashed")

output = "schema"
dot.render(output, format="png", cleanup=True)
print(f"Schema diagram saved to {output}.png")
