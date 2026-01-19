from app.core.security import decode_access_token

token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjQsImVtYWlsIjoidGVzdEByZWNydWl0ZXIuY29tIiwicm9sZSI6InJlY3J1aXRlciIsImV4cCI6MTc2ODgyMDEyM30.b0_B8TBnl82ONwcLxjnRpciCZ2hlifVRUPtDt-0kUeE"

payload = decode_access_token(token)
print("Decoded payload:", payload)

if payload:
    print("User ID (sub):", payload.get('sub'))
    print("Email:", payload.get('email'))
    print("Role:", payload.get('role'))
    print("Expiry:", payload.get('exp'))
else:
    print("Token decode failed!")
