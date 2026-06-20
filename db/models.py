from datetime import datetime
from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    student_id = Column(String(100), nullable=True)
    role = Column(String(50), nullable=False, default="student")
    phone = Column(String(50), nullable=True)
    nationality = Column(String(100), nullable=True)
    programme_of_study = Column(String(255), nullable=True)
    resident = Column(String(50), nullable=True)
    is_suspended = Column(Boolean, nullable=False, default=False)
    notification_email = Column(Boolean, nullable=False, default=True)
    notification_sms = Column(Boolean, nullable=False, default=True)
    notification_in_app = Column(Boolean, nullable=False, default=True)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Relationships
    requests = relationship("Request", back_populates="student", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="student", cascade="all, delete-orphan")


class Provider(Base):
    __tablename__ = "providers"

    id = Column(String(100), primary_key=True)
    name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    specialty = Column(ARRAY(String(100)), nullable=False, default=[])
    notes = Column(Text, nullable=True)
    rating = Column(Integer, nullable=False, default=5)
    created_at = Column(DateTime, nullable=False, default=func.now())
    # Prevent exact duplicate requests: sha256 hash of (student|category|description|photo_count)
    request_hash = Column(String(64), nullable=True, unique=True)

    # Relationships
    requests = relationship("Request", back_populates="provider")


class Request(Base):
    __tablename__ = "requests"

    id = Column(String(100), primary_key=True)
    student_id = Column(String(100), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    student_name = Column(String(255), nullable=False)
    student_email = Column(String(255), nullable=False)
    student_phone = Column(String(50), nullable=True)
    category = Column(String(100), nullable=False)
    description = Column(Text, nullable=False)
    photos = Column(ARRAY(String), nullable=False, default=[])
    priority = Column(String(50), nullable=False, default="normal")
    additional_notes = Column(Text, nullable=True)
    status = Column(String(50), nullable=False, default="submitted")
    provider_cost = Column(Float, nullable=True)
    service_charge = Column(Float, nullable=True)
    total_cost = Column(Float, nullable=True)
    is_quote_accepted = Column(Boolean, nullable=False, default=False)
    deposit_paid = Column(Boolean, nullable=False, default=False)
    final_paid = Column(Boolean, nullable=False, default=False)
    ready_notes = Column(Text, nullable=True)
    operator_notes = Column(Text, nullable=True)
    internal_notes = Column(Text, nullable=True)
    provider_id = Column(String(100), ForeignKey("providers.id", ondelete="SET NULL"), nullable=True)
    provider_translation = Column(Text, nullable=True)
    cancel_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Relationships
    student = relationship("User", back_populates="requests", foreign_keys=[student_id])
    provider = relationship("Provider", back_populates="requests", foreign_keys=[provider_id])
    notifications = relationship("Notification", back_populates="request", cascade="all, delete-orphan")
    activity_logs = relationship("ActivityLog", back_populates="request", cascade="all, delete-orphan")


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(100), primary_key=True, index=True)
    student_id = Column(String(100), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    body = Column(Text, nullable=False)
    is_read = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    request_id = Column(String(100), ForeignKey("requests.id", ondelete="SET NULL"), nullable=True, index=True)
    amount = Column(Float, nullable=True)

    # Relationships
    student = relationship("User", back_populates="notifications", foreign_keys=[student_id])
    request = relationship("Request", back_populates="notifications", foreign_keys=[request_id])


class ActivityLog(Base):
    __tablename__ = "activity_logs"

    id = Column(String(100), primary_key=True, index=True)
    user_id = Column(String(100), nullable=False)  # Refers to user id (not FK since it logs general actions)
    user_name = Column(String(255), nullable=False)
    user_email = Column(String(255), nullable=False)
    action = Column(String(100), nullable=False)
    details = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    request_id = Column(String(100), ForeignKey("requests.id", ondelete="SET NULL"), nullable=True, index=True)

    # Relationships
    request = relationship("Request", back_populates="activity_logs", foreign_keys=[request_id])


class PushSubscription(Base):
    __tablename__ = "push_subscriptions"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(100), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    endpoint = Column(Text, nullable=False, unique=True)
    auth_key = Column(String(255), nullable=False)
    p256dh_key = Column(String(255), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())

    # Relationship back to user (optional)
    user = relationship("User")
