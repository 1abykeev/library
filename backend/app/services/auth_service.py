from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.security import hash_password, verify_password, create_access_token
from app.repositories.user_repository import UserRepository
from app.schemas.user_schema import UserLogin, UserRegister


class AuthService:
    def __init__(self, db: Session):
        self.repo = UserRepository(db)

    def register(self, data: UserRegister):
        if self.repo.count() > 0:
            raise HTTPException(
                status.HTTP_403_FORBIDDEN,
                "Регистрация закрыта. В системе уже есть администратор.",
            )
        if self.repo.get_by_email(data.email):
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "Пользователь с таким email уже существует")
        user = self.repo.create(
            full_name=data.full_name,
            email=data.email,
            password_hash=hash_password(data.password),
            role="admin",
        )
        return user

    def login(self, data: UserLogin):
        user = self.repo.get_by_email(data.email)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Неверный email или пароль")
        token = create_access_token(user.id, extra={"role": user.role})
        return user, token
