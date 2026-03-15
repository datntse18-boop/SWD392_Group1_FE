# Implement Role-Based Authorization & Business Flows for CycleTrust

Adding `[Authorize]` role-based access control to all controllers and business logic validation in services, based on the approved [role_flows.md](file:///C:/Users/PC/.gemini/antigravity/brain/68021154-6044-4948-a733-b8c1f234b435/role_flows.md).

## User Review Required

> [!IMPORTANT]
> **Registration change**: `RegisterRequestDto.RoleId` will be removed. All users register as **Buyer** by default. The field will be ignored in `AuthService.RegisterAsync()`.

> [!WARNING]
> **Breaking change for existing API consumers**: All endpoints (except Auth login/register and GET bikes) will now require a valid JWT token with the correct role. Existing clients without auth will receive `401 Unauthorized`.

---

## Proposed Changes

### Auth & Registration Fix

#### [MODIFY] [AuthDTOs.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/DTOs/AuthDTOs/AuthDTOs.cs)
- Remove `RoleId` property from [RegisterRequestDto](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/DTOs/AuthDTOs/AuthDTOs.cs#21-30) (users always register as Buyer)

#### [MODIFY] [AuthService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/AuthService.cs)
- Hardcode `RoleId = 2` (BUYER) in [RegisterAsync()](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/AuthService.cs#51-85) instead of using `dto.RoleId`

---

### Controller Authorization (all 12 controllers)

Each controller gets `[Authorize]` at class level + specific role requirements per action:

#### [MODIFY] [AuthController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/AuthController.cs)
- Add `[AllowAnonymous]` to Login and Register (already public, make explicit)

#### [MODIFY] [UsersController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/UsersController.cs)
- `[Authorize(Roles = "ADMIN")]` on class level
- Add new endpoint: `PUT /api/users/{id}/role` — Admin changes user roleId (Buyer→Seller upgrade)

#### [MODIFY] [BikesController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/BikesController.cs)
- `[AllowAnonymous]` on GET endpoints (public browse)
- `[Authorize(Roles = "SELLER")]` on POST (create listing)
- `[Authorize(Roles = "ADMIN,SELLER")]` on PUT (Admin duyệt / Seller chỉnh sửa)
- `[Authorize(Roles = "ADMIN")]` on DELETE

#### [MODIFY] [InspectionReportsController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/InspectionReportsController.cs)
- `[Authorize]` on class level
- `[Authorize(Roles = "INSPECTOR")]` on POST and PUT

#### [MODIFY] [OrdersController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/OrdersController.cs)
- `[Authorize]` on class level
- `[Authorize(Roles = "BUYER")]` on POST (create order)

#### [MODIFY] [ReviewsController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/ReviewsController.cs)
- `[Authorize]` on class level  
- `[Authorize(Roles = "BUYER")]` on POST (create review)

#### [MODIFY] [ReportsController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/ReportsController.cs)
- `[Authorize]` on class level
- `[Authorize(Roles = "BUYER")]` on POST (create dispute)
- `[Authorize(Roles = "ADMIN")]` on PUT (resolve dispute)

#### [MODIFY] [WishlistsController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/WishlistsController.cs)
- `[Authorize(Roles = "BUYER")]` on class level

#### [MODIFY] [BrandsController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/BrandsController.cs)
- `[AllowAnonymous]` on GET
- `[Authorize(Roles = "ADMIN")]` on POST, PUT, DELETE

#### [MODIFY] [CategoriesController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/CategoriesController.cs)
- `[AllowAnonymous]` on GET
- `[Authorize(Roles = "ADMIN")]` on POST, PUT, DELETE

#### [MODIFY] [RolesController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/RolesController.cs)
- `[Authorize(Roles = "ADMIN")]` on class level

#### [MODIFY] [MessagesController.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.WebAPI/Controllers/MessagesController.cs)
- `[Authorize]` on class level (authenticated, any role)

---

### Service Business Logic Validation

#### [MODIFY] [BikeService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs)
- [CreateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#78-101): Validate that `SellerId` corresponds to a user with SELLER role
- [CreateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#78-101): Always force `Status = PENDING` regardless of input

#### [MODIFY] [OrderService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/OrderService.cs)
- [CreateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#78-101): Validate bike is `APPROVED` before allowing order
- [CreateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#78-101): Validate buyer has BUYER role
- [UpdateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#102-123): Validate status transitions (PENDING→DEPOSITED→COMPLETED, or →CANCELLED)

#### [MODIFY] [InspectionReportService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/InspectionReportService.cs)
- [CreateAsync](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/BikeService.cs#78-101): Validate that `InspectorId` corresponds to a user with INSPECTOR role

#### [MODIFY] [UserService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Services/UserService.cs)
- Add new method `UpdateRoleAsync(int userId, int newRoleId)` for Admin role upgrade

#### [MODIFY] [IUserService.cs](file:///c:/FPT/FPT-SP2026/SWD392/CycleTrust/Backend_CycleTrust/Backend_CycleTrust.WebAPI/Backend_CycleTrust.BLL/Interfaces/IUserService.cs)
- Add `Task<bool> UpdateRoleAsync(int userId, int newRoleId)` to interface

---

## Verification Plan

### Automated Tests
No existing test project found. Verification via build:
```
cd c:\FPT\FPT-SP2026\SWD392\CycleTrust\Backend_CycleTrust\Backend_CycleTrust.WebAPI
dotnet build
```

### Manual Verification (via Swagger)
1. Run `dotnet run` from `Backend_CycleTrust.WebAPI` project
2. Open Swagger at `https://localhost:{port}/swagger`
3. **Test Register**: POST `/api/auth/register` — verify user is created with role BUYER (no RoleId field in request)
4. **Test Login**: POST `/api/auth/login` — copy JWT token
5. **Test Auth Required**: GET `/api/users` without token → expect `401`
6. **Test Admin Access**: Login as admin, GET `/api/users` → expect `200`
7. **Test Seller Create Bike**: Login as seller, POST `/api/bikes` → expect `201`
8. **Test Buyer Block**: Login as buyer, POST `/api/bikes` → expect `403`
9. **Test Role Upgrade**: Login as admin, PUT `/api/users/{id}/role` → change buyer to seller
