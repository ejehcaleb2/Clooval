"""add request_hash and push_subscriptions

Revision ID: add_request_hash_and_push_subscriptions
Revises: 80e584f8e894
Create Date: 2026-06-08 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = 'add_request_hash_and_push_subscriptions'
down_revision = '80e584f8e894'
branch_labels = None
depends_on = None


def upgrade():
    # Add request_hash to requests table
    try:
        op.add_column('requests', sa.Column('request_hash', sa.String(length=64), nullable=True))
    except Exception:
        pass
    # Create unique index on request_hash
    op.create_index('idx_requests_request_hash', 'requests', ['request_hash'], unique=True)

    # Create push_subscriptions table
    op.create_table(
        'push_subscriptions',
        sa.Column('id', sa.Integer(), primary_key=True, autoincrement=True),
        sa.Column('user_id', sa.String(length=255), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('endpoint', sa.Text(), nullable=False, unique=True),
        sa.Column('auth_key', sa.String(length=255), nullable=False),
        sa.Column('p256dh_key', sa.String(length=255), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.text('CURRENT_TIMESTAMP')),
    )
    op.create_index('idx_user_subscriptions', 'push_subscriptions', ['user_id'])


def downgrade():
    op.drop_index('idx_user_subscriptions', table_name='push_subscriptions')
    op.drop_table('push_subscriptions')
    op.drop_index('idx_requests_request_hash', table_name='requests')
    op.drop_column('requests', 'request_hash')
