Param(
    [string]$ApiBase = "http://localhost:5000",
    [string]$AdminEmail = "admin@example.com",
    [string]$AdminPassword = "Admin123!",
    [string]$AdminName = "Demo Admin"
)

Write-Host "== Seeding demo data ==" -ForegroundColor Cyan

# 1) Register admin (idempotent: if email exists, will fail, then continue to login)
$registerBody = @{ name = $AdminName; email = $AdminEmail; password = $AdminPassword; adminKey = $env:ADMIN_SECRET } | ConvertTo-Json
try {
    $reg = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/users/register" -ContentType 'application/json' -Body $registerBody
    Write-Host "Registered admin: $($reg?.message)" -ForegroundColor Green
}
catch {
    Write-Host "Admin registration skipped or failed (likely exists): $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2) Login to get token
$loginBody = @{ email = $AdminEmail; password = $AdminPassword } | ConvertTo-Json
$token = $null
try {
    $login = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/users/login" -ContentType 'application/json' -Body $loginBody
    $token = $login.token
    if (-not $token) { throw "No token returned" }
    Write-Host "Admin login successful." -ForegroundColor Green
}
catch {
    Write-Error "Admin login failed: $($_.Exception.Message)"; exit 1
}

$headers = @{ Authorization = "Bearer $token" }

# 3) Demo menu items
# Build ~50 demo items covering categories
$menu = @()

$baseItems = @(
    @{ name = "Garlic Bread"; category = "Starter"; description = "Toasted baguette with garlic butter and parsley."; price = 5.5 },
    @{ name = "Caesar Salad"; category = "Starter"; description = "Romaine, parmesan, croutons, house Caesar dressing."; price = 7.0 },
    @{ name = "Tomato Soup"; category = "Starter"; description = "Creamy tomato soup with basil and olive oil."; price = 6.0 },
    @{ name = "Grilled Chicken Bowl"; category = "Main"; description = "Marinated chicken, brown rice, seasonal greens."; price = 14.5 },
    @{ name = "Beef Burger"; category = "Main"; description = "Angus patty, cheddar, lettuce, tomato, brioche bun."; price = 13.0 },
    @{ name = "Margherita Pizza"; category = "Main"; description = "San Marzano tomato, mozzarella, basil, olive oil."; price = 12.0 },
    @{ name = "Salmon Teriyaki"; category = "Main"; description = "Glazed salmon, jasmine rice, sesame broccoli."; price = 18.0 },
    @{ name = "Veggie Pasta"; category = "Main"; description = "Penne, roasted veggies, pesto, pine nuts."; price = 11.5 },
    @{ name = "Chocolate Brownie"; category = "Dessert"; description = "Warm fudge brownie with vanilla ice cream."; price = 6.5 },
    @{ name = "Cheesecake"; category = "Dessert"; description = "Classic New York cheesecake with berry coulis."; price = 7.5 },
    @{ name = "Iced Latte"; category = "Beverage"; description = "Double shot espresso over ice with milk."; price = 4.5 },
    @{ name = "Lemon Iced Tea"; category = "Beverage"; description = "Fresh-brewed black tea with lemon and mint."; price = 3.8 }
)

# Add variants to reach ~50 items (unique names to avoid duplicates)
$suffixes = @("Deluxe", "Classic", "Spicy", "Herb", "Chef's", "House", "Premium", "Special", "Lite", "Family")
$categories = @("Starter", "Main", "Dessert", "Beverage")

# Start with base items
$menu += $baseItems

# Generate additional items
for ($i = 1; $i -le 38; $i++) {
    $cat = $categories[$i % $categories.Count]
    $name = "Demo Item $i"
    switch ($cat) {
        "Starter" { $desc = "Fresh starter with seasonal ingredients."; $price = 5 + ($i % 6) }
        "Main" { $desc = "Hearty main course crafted by our chef."; $price = 10 + ($i % 12) }
        "Dessert" { $desc = "Sweet dessert to finish your meal."; $price = 4 + ($i % 6) }
        "Beverage" { $desc = "Refreshing beverage served chilled."; $price = 3 + ($i % 5) }
    }
    $menu += @{ name = $name; category = $cat; description = $desc; price = [double]::Parse("$price") }
}

# 4) Insert items (skip duplicates by name)
$existing = @()
try {
    $existing = Invoke-RestMethod -Method Get -Uri "$ApiBase/api/menu" -Headers $headers
}
catch {
    Write-Host "Fetching existing menu failed, will still attempt inserts." -ForegroundColor Yellow
}

$existingNames = @()
if ($existing) { $existingNames = $existing | ForEach-Object { $_.name } }

$inserted = 0
foreach ($item in $menu) {
    if ($existingNames -contains $item.name) {
        Write-Host "Skip existing: $($item.name)" -ForegroundColor Yellow
        continue
    }
    try {
        $resp = Invoke-RestMethod -Method Post -Uri "$ApiBase/api/menu" -Headers $headers -ContentType 'application/json' -Body ($item | ConvertTo-Json)
        Write-Host "Inserted: $($item.name)" -ForegroundColor Green
        $inserted++
    }
    catch {
        Write-Host "Failed to insert $($item.name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "Seeding done. Inserted: $inserted items." -ForegroundColor Cyan

# 5) Verify
try {
    $final = Invoke-RestMethod -Method Get -Uri "$ApiBase/api/menu" -Headers $headers
    Write-Host "Total menu items now: $($final.Count)" -ForegroundColor Cyan
}
catch {
    Write-Host "Verification fetch failed." -ForegroundColor Yellow
}
