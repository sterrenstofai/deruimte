"""De testset voor fase 1. Sleutel, Nederlandse naam (met lidwoord), Engels label
voor Wikidata, Horizons-ID (voor posities), soort."""
UA = "heelal-datacheck/0.1 (fase 1; contact via github.com/sterrenstofai)"

HEMELLICHAMEN = [
    # sleutel,   naam,              en-label,                 horizons, soort
    ("zon",      "de zon",          "Sun",                    "10",     "ster"),
    ("maan",     "de maan",         "Moon",                   "301",    "maan"),
    ("mercurius","Mercurius",       "Mercury",                "199",    "planeet"),
    ("venus",    "Venus",           "Venus",                  "299",    "planeet"),
    ("aarde",    "de aarde",        "Earth",                  "399",    "planeet"),
    ("mars",     "Mars",            "Mars",                   "499",    "planeet"),
    ("jupiter",  "Jupiter",         "Jupiter",                "599",    "planeet"),
    ("saturnus", "Saturnus",        "Saturn",                 "699",    "planeet"),
    ("uranus",   "Uranus",          "Uranus",                 "799",    "planeet"),
    ("neptunus", "Neptunus",        "Neptune",                "899",    "planeet"),
    ("pluto",    "Pluto",           "Pluto",                  "999",    "dwergplaneet"),
    ("ceres",    "Ceres",           "Ceres",                  "1;",     "dwergplaneet"),
    ("io",       "Io",              "Io",                     "501",    "maan"),
    ("europa",   "Europa",          "Europa",                 "502",    "maan"),
    ("titan",    "Titan",           "Titan",                  "606",    "maan"),
    ("halley",   "de komeet Halley","Halley's Comet",         "DES=1P;CAP;NOFRAG", "komeet"),
    ("poolster", "de Poolster",     "Polaris",                None,     "ster"),
    ("sirius",   "Sirius",          "Sirius",                 None,     "ster"),
    ("betelgeuze","Betelgeuze",     "Betelgeuse",             None,     "ster"),
    ("iss",      "het ISS",         "International Space Station", "-125544", "ruimtevaartuig"),
]

# Een adres in Nederland voor de proef "wat zie je vanavond": Enschede, Oude Markt.
PLEK = {"naam": "Enschede (Oude Markt)", "lat": 52.2196, "lon": 6.8952, "hoogte_m": 40}
