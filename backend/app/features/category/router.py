from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.auth.dependencies import get_current_user
from app.core.database import get_db
from app.features.category import repository
from app.features.category.schemas import CategoryCreate, CategoryOut, CategoryUpdate
from app.models.user import User

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get(
    "",
    response_model=list[CategoryOut],
    summary="List categories",
    description="Return all categories belonging to the authenticated user.",
)
async def list_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[CategoryOut]:
    categories = repository.get_categories(db, current_user.id)
    return [CategoryOut.model_validate(c) for c in categories]


@router.post(
    "",
    response_model=CategoryOut,
    status_code=status.HTTP_201_CREATED,
    summary="Create category",
    description="Create a new category for the authenticated user.",
)
async def create_category(
    payload: CategoryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryOut:
    category = repository.create_category(
        db,
        user_id=current_user.id,
        name=payload.name,
        description=payload.description,
        icon=payload.icon,
    )
    return CategoryOut.model_validate(category)


@router.get(
    "/{category_id}",
    response_model=CategoryOut,
    summary="Get category",
    description="Fetch a single category by ID.",
)
async def get_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryOut:
    category = repository.get_category_by_id(db, category_id, current_user.id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    return CategoryOut.model_validate(category)


@router.patch(
    "/{category_id}",
    response_model=CategoryOut,
    summary="Update category",
    description="Partially update a category.",
)
async def update_category(
    category_id: str,
    payload: CategoryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> CategoryOut:
    category = repository.get_category_by_id(db, category_id, current_user.id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")

    updated = repository.update_category(
        db,
        category,
        name=payload.name,
        description=payload.description,
        icon=payload.icon,
    )
    return CategoryOut.model_validate(updated)


@router.delete(
    "/{category_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete category",
    description="Delete a category by ID.",
)
async def delete_category(
    category_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    category = repository.get_category_by_id(db, category_id, current_user.id)
    if not category:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Category not found")
    repository.delete_category(db, category)
