#!/bin/bash

# ============================================================
# QUICK DEPLOYMENT SCRIPT - Critical Database Fixes
# Usage: bash QUICK_DEPLOY.sh
# ============================================================

set -e  # Exit on error

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║     Lingayat Mali - Critical Database Fixes Deployment     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"

# Check if we're in the right directory
if [ ! -f "supabase/migrations/20250328_fix_auto_delete_alt_mobile.sql" ]; then
    echo -e "${RED}❌ Error: Migration files not found${NC}"
    echo -e "${YELLOW}Make sure you're in the project root directory${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Found all migration files${NC}"
echo ""

# Prompt for deployment method
echo -e "${YELLOW}Choose deployment method:${NC}"
echo "1) Supabase CLI (npx supabase db push)"
echo "2) Manual Dashboard (step-by-step guide)"
echo "3) Exit"
echo ""
read -p "Enter choice (1-3): " choice

case $choice in
    1)
        echo ""
        echo -e "${BLUE}🚀 Starting Supabase CLI Deployment${NC}"
        echo ""

        # Check if CLI is installed
        if ! command -v npx &> /dev/null; then
            echo -e "${RED}❌ Error: npx not found${NC}"
            echo "Please install Node.js first"
            exit 1
        fi

        echo -e "${YELLOW}📝 Make sure you have:${NC}"
        echo "1. Linked your Supabase project: npx supabase link --project-ref qomnebvjrdlqvlwrpmod"
        echo "2. Database credentials configured"
        echo ""

        read -p "Are you ready to proceed? (y/n): " ready

        if [ "$ready" != "y" ]; then
            echo "Cancelled"
            exit 0
        fi

        echo ""
        echo -e "${BLUE}📤 Pushing migrations to Supabase...${NC}"
        echo ""

        npx supabase db push

        echo ""
        echo -e "${GREEN}✅ Migrations deployed successfully!${NC}"
        echo ""
        echo -e "${BLUE}📋 Next steps:${NC}"
        echo "1. Verify in Supabase Dashboard: https://app.supabase.com"
        echo "2. Run validation tests"
        echo "3. Update your application code"
        echo ""
        ;;

    2)
        echo ""
        echo -e "${BLUE}📖 Manual Dashboard Deployment${NC}"
        echo ""
        echo "Follow these steps:"
        echo "1. Open: DEPLOY_MANUAL_DASHBOARD.md"
        echo "2. Go to: https://app.supabase.com"
        echo "3. Select your project"
        echo "4. Go to SQL Editor"
        echo "5. Follow the step-by-step guide in the document"
        echo ""
        ;;

    3)
        echo "Cancelled"
        exit 0
        ;;

    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo -e "${GREEN}Done!${NC}"
