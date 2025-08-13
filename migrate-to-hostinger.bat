@echo off
echo 🚀 DOCMe Hostinger Migration Setup
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Please run this script from the root directory of your DOCMe project
    pause
    exit /b 1
)

REM Install API dependencies
echo 📦 Installing API dependencies...
cd api
call npm install prisma @prisma/client bcryptjs jsonwebtoken express-rate-limit helmet pg
call npm install --save-dev @types/jsonwebtoken @types/bcryptjs @types/pg

REM Generate Prisma client
echo 🔧 Generating Prisma client...
call npx prisma generate

REM Check environment variables
echo 🔍 Checking environment configuration...
if not exist ".env" (
    echo ⚠️  No .env file found. Creating from template...
    copy .env.hostinger .env
    echo ✅ Please update the .env file with your Hostinger PostgreSQL credentials
) else (
    echo ✅ .env file exists
)

REM Frontend cleanup
echo 🧹 Cleaning up frontend dependencies...
cd ..
call npm uninstall @supabase/supabase-js

echo.
echo 🎉 Basic setup complete!
echo.
echo Next steps:
echo 1. Update your api/.env file with Hostinger PostgreSQL credentials
echo 2. Run: cd api ^&^& npx prisma db push
echo 3. Test the connection: cd api ^&^& npm run dev
echo 4. Check health endpoint: http://localhost:3001/health
echo 5. Deploy to Hostinger following the migration guide
echo.
echo 📖 See HOSTINGER_MIGRATION_GUIDE.md for detailed instructions
echo.

REM Build the project
echo 🏗️  Building project...
cd api
call npm run build

if %errorlevel% equ 0 (
    echo ✅ Build successful! Ready for deployment
) else (
    echo ⚠️  Build issues detected. Please check the errors above
)

echo.
echo 🚀 Setup completed!
echo Your DOCMe application is now ready for Hostinger PostgreSQL!
echo.
echo ⚠️  IMPORTANT: Don't forget to update your DATABASE_URL in api/.env
echo.
pause
