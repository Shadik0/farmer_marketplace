from pydantic import BaseModel, Field
from typing import Optional, List

class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    phone: Optional[str] = None
    farm_name: Optional[str] = None
    location: str
    address: Optional[str] = None
    bio: Optional[str] = None
    rating: float = 4.9
    avatar_url: Optional[str] = None

class ProductCreate(BaseModel):
    farmer_id: int
    name: str = Field(..., min_length=2)
    category: str
    description: Optional[str] = ""
    photo_url: Optional[str] = ""
    unit: str = Field(..., min_length=1)
    price: float = Field(..., gt=0)
    available_quantity: float = Field(..., ge=0)
    min_order_quantity: float = Field(default=1.0, gt=0)
    bulk_discount_qty: float = Field(default=0.0, ge=0)
    bulk_discount_percent: float = Field(default=0.0, ge=0, le=100)
    harvest_date: str
    availability_date: str
    pickup_delivery: str
    location: str
    organic_certified: bool = False
    pesticide_free: bool = True
    market_price_estimate: Optional[float] = None

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    description: Optional[str] = None
    photo_url: Optional[str] = None
    unit: Optional[str] = None
    price: Optional[float] = None
    available_quantity: Optional[float] = None
    min_order_quantity: Optional[float] = None
    bulk_discount_qty: Optional[float] = None
    bulk_discount_percent: Optional[float] = None
    harvest_date: Optional[str] = None
    availability_date: Optional[str] = None
    pickup_delivery: Optional[str] = None
    location: Optional[str] = None
    organic_certified: Optional[bool] = None
    pesticide_free: Optional[bool] = None
    status: Optional[str] = None

class OrderItemRequest(BaseModel):
    product_id: int
    quantity: float = Field(..., gt=0)

class OrderCreateRequest(BaseModel):
    buyer_id: int
    items: List[OrderItemRequest] = Field(..., min_length=1)
    delivery_type: str = Field(..., pattern="^(pickup|delivery)$")
    delivery_address: Optional[str] = ""
    payment_method: str = Field(..., pattern="^(cash_on_pickup|cash_on_delivery|simulated_instant_transfer)$")
    notes: Optional[str] = ""

class OrderStatusUpdate(BaseModel):
    status: str = Field(..., pattern="^(requested|accepted|ready|completed|cancelled)$")
    cancel_reason: Optional[str] = None
    user_id: int # who is triggering the update (farmer or buyer)

class AdminModerationRequest(BaseModel):
    admin_id: int
    action: str = Field(..., pattern="^(approved|flagged|rejected|removed)$")
    reason: Optional[str] = ""
