
import json

db_path = r"c:\Users\Sushant\Marbie_Bridal\src\data\db.json"

with open(db_path, "r", encoding="utf-8") as f:
    db = json.load(f)

# Add UI labels to config
db["config"]["labels"] = {
    "heroButtons": {
        "primary": "Shop the Collection",
        "primaryLink": "/necklaces",
        "secondary": "VIEW LOOKBOOK",
        "secondaryLink": "/lookbook"
    },
    "categorySection": {
        "title": "Shop by Category",
        "exploreText": "EXPLORE COLLECTION"
    },
    "arrivalsSection": {
        "title": "New Arrivals",
        "subtitle": "Hand-selected pieces from our latest curation.",
        "viewAllText": "VIEW ALL PIECES",
        "viewAllLink": "/necklaces"
    },
    "instagramSection": {
        "handle": "@MARBIE_JEWELRY",
        "shopNowText": "Shop Now"
    },
    "productDetail": {
        "loadingText": "Preparing Masterpiece...",
        "fallbackDesc": "An exquisite piece crafted with unparalleled attention to detail. Designed for the modern aesthete who appreciates heritage craftsmanship and timeless elegance.",
        "addToBag": "ADD TO BAG",
        "valueProps": [
            {"icon": "local_shipping", "text": "Free Shipping"},
            {"icon": "autorenew", "text": "7-Day Returns"}
        ]
    },
    "auth": {
        "loginSubtitle": "Sign in to your account"
    }
}

with open(db_path, "w", encoding="utf-8") as f:
    json.dump(db, f, indent=2)

print("Updated db.json successfully.")
