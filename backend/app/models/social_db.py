from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, JSON, ForeignKey, Enum as SQLEnum, Index
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum
from app.database import Base

# Enums
class PostType(str, enum.Enum):
    text = "text"
    image = "image"
    video = "video"
    link = "link"
    achievement = "achievement"
    workout = "workout"
    trip = "trip"
    budget = "budget"
    finance = "finance"

class PostVisibility(str, enum.Enum):
    public = "public"
    friends = "friends"
    private = "private"

class FriendRequestStatus(str, enum.Enum):
    pending = "pending"
    accepted = "accepted"
    declined = "declined"
    cancelled = "cancelled"

class ShareType(str, enum.Enum):
    achievement = "achievement"
    workout = "workout"
    trip = "trip"
    budget = "budget"
    finance = "finance"
    post = "post"

# Database Models
class Friend(Base):
    __tablename__ = "friends"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    friend_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(String(20), default="active")  # active, blocked
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="friends")
    friend = relationship("User", foreign_keys=[friend_id], back_populates="friend_of")
    
    __table_args__ = (
        Index('idx_user_friend', 'user_id', 'friend_id'),
        Index('idx_friend_user', 'friend_id', 'user_id'),
    )

class FriendRequest(Base):
    __tablename__ = "friend_requests"
    
    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    receiver_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    status = Column(SQLEnum(FriendRequestStatus), default=FriendRequestStatus.pending)
    message = Column(Text)
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    responded_at = Column(DateTime)
    
    # Relationships
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_friend_requests")
    receiver = relationship("User", foreign_keys=[receiver_id], back_populates="received_friend_requests")
    
    __table_args__ = (
        Index('idx_sender_receiver', 'sender_id', 'receiver_id'),
    )

class Post(Base):
    __tablename__ = "posts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    post_type = Column(SQLEnum(PostType), nullable=False)
    content = Column(Text)
    media_urls = Column(JSON)  # List of image/video URLs
    link_url = Column(String(500))
    link_preview = Column(JSON)  # Link preview data
    visibility = Column(SQLEnum(PostVisibility), default=PostVisibility.public)
    location = Column(String(200))
    hashtags = Column(JSON)  # List of hashtags
    mentions = Column(JSON)  # List of mentioned user IDs
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime)
    shared_item_id = Column(Integer)  # Reference to shared item (achievement, workout, etc.)
    shared_item_type = Column(String(50))  # Type of shared item
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="posts")
    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")
    likes = relationship("Like", back_populates="post", cascade="all, delete-orphan")
    shares = relationship("Share", back_populates="post", cascade="all, delete-orphan")
    saved_posts = relationship("SavedPost", back_populates="post", cascade="all, delete-orphan")
    reported_posts = relationship("ReportedPost", back_populates="post", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_user_created', 'user_id', 'created_at'),
    )

class Comment(Base):
    __tablename__ = "comments"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    parent_comment_id = Column(Integer, ForeignKey("comments.id"))  # For nested comments
    content = Column(Text, nullable=False)
    likes_count = Column(Integer, default=0)
    is_edited = Column(Boolean, default=False)
    edited_at = Column(DateTime)
    is_deleted = Column(Boolean, default=False)
    deleted_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="comments")
    user = relationship("User", back_populates="comments")
    parent_comment = relationship("Comment", remote_side=[id], back_populates="replies")
    replies = relationship("Comment", back_populates="parent_comment", cascade="all, delete-orphan")
    likes = relationship("CommentLike", back_populates="comment", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_post_created', 'post_id', 'created_at'),
    )

class CommentLike(Base):
    __tablename__ = "comment_likes"
    
    id = Column(Integer, primary_key=True, index=True)
    comment_id = Column(Integer, ForeignKey("comments.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    comment = relationship("Comment", back_populates="likes")
    user = relationship("User")
    
    __table_args__ = (
        Index('idx_comment_user', 'comment_id', 'user_id'),
    )

class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="likes")
    user = relationship("User", back_populates="likes")
    
    __table_args__ = (
        Index('idx_post_user', 'post_id', 'user_id'),
    )

class Share(Base):
    __tablename__ = "shares"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_type = Column(String(50))  # repost, share_to_friends, etc.
    message = Column(Text)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="shares")
    user = relationship("User", back_populates="shares")

class SavedPost(Base):
    __tablename__ = "saved_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    collection_name = Column(String(100))  # Optional collection/folder
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="saved_posts")
    user = relationship("User", back_populates="saved_posts")
    
    __table_args__ = (
        Index('idx_user_post', 'user_id', 'post_id'),
    )

class ReportedPost(Base):
    __tablename__ = "reported_posts"
    
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    reporter_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(100), nullable=False)  # spam, harassment, inappropriate, etc.
    description = Column(Text)
    status = Column(String(20), default="pending")  # pending, reviewed, resolved, dismissed
    reviewed_by = Column(Integer, ForeignKey("users.id"))
    reviewed_at = Column(DateTime)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    post = relationship("Post", back_populates="reported_posts")
    reporter = relationship("User", foreign_keys=[reporter_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])

class UserProfile(Base):
    __tablename__ = "user_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, unique=True)
    bio = Column(Text)
    location = Column(String(200))
    website = Column(String(500))
    birth_date = Column(DateTime)
    profile_picture = Column(String(500))
    cover_photo = Column(String(500))
    interests = Column(JSON)  # List of interests
    skills = Column(JSON)  # List of skills
    education = Column(JSON)  # Education history
    work_experience = Column(JSON)  # Work experience
    social_links = Column(JSON)  # Social media links
    privacy_settings = Column(JSON)  # Privacy preferences
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="profile", uselist=False)

class Follow(Base):
    __tablename__ = "follows"
    
    id = Column(Integer, primary_key=True, index=True)
    follower_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    following_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    follower = relationship("User", foreign_keys=[follower_id], back_populates="following")
    following_user = relationship("User", foreign_keys=[following_id], back_populates="followers")
    
    __table_args__ = (
        Index('idx_follower_following', 'follower_id', 'following_id'),
    )

class BlockedUser(Base):
    __tablename__ = "blocked_users"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    blocked_user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    reason = Column(String(200))
    created_at = Column(DateTime, default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id], back_populates="blocked_users")
    blocked_user = relationship("User", foreign_keys=[blocked_user_id], back_populates="blocked_by")
    
    __table_args__ = (
        Index('idx_user_blocked', 'user_id', 'blocked_user_id'),
    )

class SharedItem(Base):
    __tablename__ = "shared_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    share_type = Column(SQLEnum(ShareType), nullable=False)
    item_id = Column(Integer, nullable=False)  # ID of the shared item (achievement, workout, etc.)
    item_type = Column(String(50), nullable=False)  # achievement, workout, trip, budget, finance
    title = Column(String(200), nullable=False)
    description = Column(Text)
    content = Column(JSON)  # Shared item data
    visibility = Column(SQLEnum(PostVisibility), default=PostVisibility.public)
    likes_count = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)
    shares_count = Column(Integer, default=0)
    views_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=func.now(), index=True)
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="shared_items")
    
    __table_args__ = (
        Index('idx_user_type_created', 'user_id', 'item_type', 'created_at'),
    )

