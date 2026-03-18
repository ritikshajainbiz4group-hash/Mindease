from sqlalchemy.orm import Session

from app.models.category import Category


def get_categories(db: Session, user_id: str) -> list[Category]:
    return db.query(Category).filter(Category.created_by == user_id).all()


def get_category_by_id(db: Session, category_id: str, user_id: str) -> Category | None:
    return (
        db.query(Category)
        .filter(Category.id == category_id, Category.created_by == user_id)
        .first()
    )


def create_category(
    db: Session,
    user_id: str,
    name: str,
    description: str | None = None,
    icon: str | None = None,
) -> Category:
    category = Category(
        name=name,
        description=description,
        icon=icon,
        created_by=user_id,
    )
    db.add(category)
    db.commit()
    db.refresh(category)
    return category


def update_category(
    db: Session,
    category: Category,
    name: str | None = None,
    description: str | None = None,
    icon: str | None = None,
) -> Category:
    if name is not None:
        category.name = name
    if description is not None:
        category.description = description
    if icon is not None:
        category.icon = icon
    db.commit()
    db.refresh(category)
    return category


def delete_category(db: Session, category: Category) -> None:
    db.delete(category)
    db.commit()
