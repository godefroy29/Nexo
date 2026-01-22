# Business Affiliate System Setup

## Overview
The system now supports business-based registration and data segregation. Users register with affiliate codes and can only see data from their own business network.

## Test Businesses & Affiliate Codes

1. **Tech Solutions Inc** - Code: `TECH2024`
2. **Green Energy Corp** - Code: `GREEN2024` 
3. **Digital Marketing Pro** - Code: `DIGITAL2024`
4. **Finance Experts Ltd** - Code: `FINANCE2024`

## Access Rules

### Admin Role
- Can see all users, listings, and businesses
- Can manage user roles and disable listings
- Not restricted to any business

### Backoffice Role  
- Can see all users, listings, and businesses
- Can manage listings but not user roles
- Not restricted to any business

### Client/Visitor Roles
- Can only see users and listings from their own business
- Must register with a valid affiliate code
- Automatically assigned to the business matching their affiliate code

## User Registration Process

1. User enters personal details (name, company, email, password)
2. User enters affiliate code (e.g., TECH2024)
3. System validates affiliate code exists
4. User is automatically linked to the matching business
5. User can only see data from their business network

## Test Users CSV
See `test_users.csv` for complete login credentials including:
- Admin and backoffice accounts (not tied to businesses)  
- Business-specific client and visitor accounts
- Different affiliate codes for testing

## Key Features

- **Business Segregation**: Users only see listings/profiles from their business
- **Affiliate Code Validation**: Invalid codes prevent registration
- **Role-Based Permissions**: Admins can manage everything, others are restricted
- **Automatic Business Assignment**: Users are linked to businesses via affiliate codes

## Next Steps

1. Users can now register using the test credentials or create new accounts with affiliate codes
2. Test the business segregation by logging in as different users
3. Admin users can manage roles and disable listings across all businesses
4. Consider adding business management features for business owners