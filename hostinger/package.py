import sys
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


source = Path(__file__).resolve().parent
output = Path(sys.argv[1]).resolve()
web = source.parent / "dist"

with ZipFile(output, "w", ZIP_DEFLATED, compresslevel=6) as archive:
    for path in sorted(web.rglob("*")):
        relative = path.relative_to(web)
        if not path.is_file() or relative.parts[0] == "server":
            continue
        if any(part.startswith(".") for part in relative.parts):
            continue
        target = f"smcc-private/assets/{relative.as_posix()}"
        if relative.as_posix() == "index.html":
            html = path.read_text(encoding="utf-8")
            archive.writestr(target, html.replace('<html lang="th">', '<html lang="th" data-auth="password">'))
        else:
            archive.write(path, target)
    archive.write(source / "api.php", "public_html/api/index.php")
    archive.write(source / ".htaccess", "public_html/.htaccess")
    archive.write(source / "index.php", "public_html/index.php")
    for name in ("bootstrap.php", "send-verification.php", "landing.html", "entry.js"):
        archive.write(source / name, f"smcc-private/{name}")
    for path in sorted((source / "vendor" / "PHPMailer").iterdir()):
        archive.write(path, f"smcc-private/vendor/PHPMailer/{path.name}")
    for name in ("README.md", "schema.sql", "smcc-config.example.php"):
        archive.write(source / name, name)

with ZipFile(output) as archive:
    bad_file = archive.testzip()
    if bad_file:
        raise ValueError(f"Corrupt file in web package: {bad_file}")
    print(f"{output} ({len(archive.namelist())} files)")
