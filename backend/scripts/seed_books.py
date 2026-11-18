import os
import sys

# Add parent directory to path so we can import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models import models

def seed_books():
    db = SessionLocal()
    try:
        categories = [
            {"name": "Computer Science", "description": "Books related to CS and programming"},
            {"name": "Mathematics", "description": "Books related to Math"},
            {"name": "Physics", "description": "Books related to Physics"},
            {"name": "Literature", "description": "Classic and modern literature"},
            {"name": "Electrical Engineering", "description": "EE related books"}
        ]
        
        # Insert categories if they don't exist
        for cat_data in categories:
            cat = db.query(models.Category).filter(models.Category.name == cat_data["name"]).first()
            if not cat:
                cat = models.Category(name=cat_data["name"], description=cat_data["description"])
                db.add(cat)
                db.flush()
            cat_data["id"] = cat.id
            
        db.commit()
        
        # Now add some books
        books = [
            {
                "isbn": "978-0131103627",
                "title": "The C Programming Language",
                "author": "Brian W. Kernighan, Dennis M. Ritchie",
                "category_id": next(c["id"] for c in categories if c["name"] == "Computer Science"),
                "publisher": "Prentice Hall",
                "publication_year": 1988,
                "total_copies": 5,
                "available_copies": 5,
                "shelf_location": "CS-A1"
            },
            {
                "isbn": "978-0201835953",
                "title": "The Mythical Man-Month",
                "author": "Frederick P. Brooks Jr.",
                "category_id": next(c["id"] for c in categories if c["name"] == "Computer Science"),
                "publisher": "Addison-Wesley",
                "publication_year": 1995,
                "total_copies": 3,
                "available_copies": 3,
                "shelf_location": "CS-A2"
            },
            {
                "isbn": "978-1118473224",
                "title": "Calculus",
                "author": "James Stewart",
                "category_id": next(c["id"] for c in categories if c["name"] == "Mathematics"),
                "publisher": "Cengage Learning",
                "publication_year": 2015,
                "total_copies": 10,
                "available_copies": 10,
                "shelf_location": "MATH-B1"
            },
            {
                "isbn": "978-0134098924",
                "title": "University Physics",
                "author": "Hugh D. Young, Roger A. Freedman",
                "category_id": next(c["id"] for c in categories if c["name"] == "Physics"),
                "publisher": "Pearson",
                "publication_year": 2015,
                "total_copies": 8,
                "available_copies": 8,
                "shelf_location": "PHY-C1"
            },
            {
                "isbn": "978-0743273565",
                "title": "The Great Gatsby",
                "author": "F. Scott Fitzgerald",
                "category_id": next(c["id"] for c in categories if c["name"] == "Literature"),
                "publisher": "Scribner",
                "publication_year": 1925,
                "total_copies": 4,
                "available_copies": 4,
                "shelf_location": "LIT-D1"
            },
            {
                "isbn": "978-0198754044",
                "title": "Microelectronic Circuits",
                "author": "Adel S. Sedra, Kenneth C. Smith",
                "category_id": next(c["id"] for c in categories if c["name"] == "Electrical Engineering"),
                "publisher": "Oxford University Press",
                "publication_year": 2014,
                "total_copies": 6,
                "available_copies": 6,
                "shelf_location": "EE-E1"
            }
        ]
        
        for book_data in books:
            book = db.query(models.Book).filter(models.Book.isbn == book_data["isbn"]).first()
            if not book:
                book = models.Book(**book_data)
                db.add(book)
                print(f"Added book: {book_data['title']}")
            else:
                print(f"Book already exists: {book_data['title']}")
                
        db.commit()
        print("Successfully seeded books and categories!")
        
    except Exception as e:
        print(f"Error seeding books: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_books()
