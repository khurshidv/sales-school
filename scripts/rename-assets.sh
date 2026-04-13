#!/bin/bash
# Rename and organize game assets from AI-generated names to asset-map IDs
# Run from project root: bash scripts/rename-assets.sh

set -euo pipefail

ROOT="/Users/xurshid/Documents/PROJECTS/Antigravity/Sales school/sales-school"
SRC="$ROOT/game/docs/car game"
DEST="$ROOT/public/assets/scenarios/car-dealership"
PROCESSED="$SRC/processed"

# Create target directories
mkdir -p "$DEST/backgrounds"
mkdir -p "$DEST/characters"
mkdir -p "$DEST/cars"
mkdir -p "$DEST/ui"

echo "=== Copying Backgrounds (JPEG → JPEG, no transparency needed) ==="
cp "$SRC/01- Backgrounds/download/Chevrolet_dealership_interior_"*.jpeg "$DEST/backgrounds/bg_showroom.jpg"
cp "$SRC/01- Backgrounds/download/Chevrolet_dealership_entrance_"*.jpeg "$DEST/backgrounds/bg_showroom_entrance.jpg"
cp "$SRC/01- Backgrounds/download/Manager_office_Chevrolet_"*.jpeg "$DEST/backgrounds/bg_manager_office.jpg"
cp "$SRC/01- Backgrounds/download/VIP_client_lounge_"*.jpeg "$DEST/backgrounds/bg_vip_lounge.jpg"
cp "$SRC/01- Backgrounds/download/Chevrolet_dealership_parking_"*.jpeg "$DEST/backgrounds/bg_parking.jpg"
cp "$SRC/01- Backgrounds/download/Chevrolet_dealership_Tashkent_"*.jpeg "$DEST/backgrounds/bg_showroom_alt.jpg"
echo "  ✓ 6 backgrounds"

echo "=== Copying Characters (from processed PNGs with transparent bg) ==="

# CHR-T01 Rustam
cp "$PROCESSED/characters/CHR-T01_Warm_smile_genuine_"*.png "$DEST/characters/chr_rustam_friendly.png"
cp "$PROCESSED/characters/CHR-T01_Focused_expression_arms_"*.png "$DEST/characters/chr_rustam_serious.png"
cp "$PROCESSED/characters/CHR-T01_Proud_smile_paternal_"*.png "$DEST/characters/chr_rustam_proud.png"
cp "$PROCESSED/characters/CHR-T01_Disappointment_heavy_eyebrows_"*.png "$DEST/characters/chr_rustam_disappointed.png"
cp "$PROCESSED/characters/CHR-T01_Uzbek_man_wearing_"*.png "$DEST/characters/chr_rustam_neutral.png"
echo "  ✓ Rustam (5 emotions)"

# CHR-T02 Dilnoza
cp "$PROCESSED/characters/CHR-T02_Uzbek_woman_sales_"*.png "$DEST/characters/chr_dilnoza_neutral.png"
cp "$PROCESSED/characters/CHR-T02_Woman_sales_consultant_202604071625.png" "$DEST/characters/chr_dilnoza_smirk.png"
cp "$PROCESSED/characters/CHR-T02_Woman_sales_consultant_202604071625_2.png" "$DEST/characters/chr_dilnoza_helpful.png"
cp "$PROCESSED/characters/CHR-T02_Woman_sales_consultant_202604071625_3.png" "$DEST/characters/chr_dilnoza_explaining.png"
echo "  ✓ Dilnoza (4 emotions)"

# CHR-C01 Bobur
cp "$PROCESSED/characters/CHR-C01_Uzbek_man_holding_"*.png "$DEST/characters/chr_bobur_neutral.png"
cp "$PROCESSED/characters/CHR-C01_Man_thinking_with_"*.png "$DEST/characters/chr_bobur_thoughtful.png"
cp "$PROCESSED/characters/CHR-C01_Curious_person_looking_"*.png "$DEST/characters/chr_bobur_interested.png"
cp "$PROCESSED/characters/CHR-C01_Relieved_happy_expression_"*.png "$DEST/characters/chr_bobur_happy.png"
cp "$PROCESSED/characters/CHR-C01_Eyebrows_raised,_eyes_"*.png "$DEST/characters/chr_bobur_surprised.png"
echo "  ✓ Bobur (5 emotions)"

# CHR-C02 Kamola
cp "$PROCESSED/characters/CHR-C02_Uzbek_businesswoman_holding_202604071621.png" "$DEST/characters/chr_kamola_confident.png"
cp "$PROCESSED/characters/CHR-C02_Raised_eyebrow_slight_"*.png "$DEST/characters/chr_kamola_skeptical.png"
cp "$PROCESSED/characters/CHR-C02_Surprise_eyebrows_raised_"*.png "$DEST/characters/chr_kamola_impressed.png"
cp "$PROCESSED/characters/CHR-C02_Eyebrows_raised,_phone_"*.png "$DEST/characters/chr_kamola_checking.png"
cp "$PROCESSED/characters/CHR-C02_Uzbek_businesswoman_holding_202604071621_2.png" "$DEST/characters/chr_kamola_neutral.png"
echo "  ✓ Kamola (5 emotions)"

# CHR-C03 Javlon
cp "$PROCESSED/characters/CHR-C03_Firm_jaw_arms_"*.png "$DEST/characters/chr_javlon_stubborn.png"
cp "$PROCESSED/characters/CHR-C03_Considering,_hand_on_"*.png "$DEST/characters/chr_javlon_thinking.png"
cp "$PROCESSED/characters/CHR-C03_Uzbek_man_with_"*.png "$DEST/characters/chr_javlon_touched.png"
cp "$PROCESSED/characters/CHR-C03_Uzbek_man_portrait_"*.png "$DEST/characters/chr_javlon_neutral.png"
echo "  ✓ Javlon (4 emotions)"

# CHR-C04 Nilufar
cp "$PROCESSED/characters/CHR-C04_Concerned_brow_maternal_"*.png "$DEST/characters/chr_nilufar_worried.png"
cp "$PROCESSED/characters/CHR-C04_Mother_imagining_family_"*.png "$DEST/characters/chr_nilufar_thoughtful.png"
cp "$PROCESSED/characters/CHR-C04_Uzbek_woman_with_"*.png "$DEST/characters/chr_nilufar_happy.png"
cp "$PROCESSED/characters/CHR-C04_Uzbek_woman_caring_"*.png "$DEST/characters/chr_nilufar_caring.png"
echo "  ✓ Nilufar (4 emotions)"

# CHR-C05 Abdullaev
cp "$PROCESSED/characters/CHR-C05_Checking_watch_tapping_"*.png "$DEST/characters/chr_abdullaev_impatient.png"
cp "$PROCESSED/characters/CHR-C05_Uzbek_CEO_in_"*.png "$DEST/characters/chr_abdullaev_neutral.png"
cp "$PROCESSED/characters/CHR-C05_Man"*"s_stern_face_"*.png "$DEST/characters/chr_abdullaev_impressed.png" 2>/dev/null || cp "$PROCESSED/characters/"*stern_face*.png "$DEST/characters/chr_abdullaev_impressed.png"
cp "$PROCESSED/characters/CHR-C05_Unreadable_poker_face_"*.png "$DEST/characters/chr_abdullaev_poker.png"
echo "  ✓ Abdullaev (4 emotions)"

# CHR-C06 Sardor
cp "$PROCESSED/characters/CHR-C06_Neutral_expression_pleasant_202604071623.png" "$DEST/characters/chr_sardor_neutral.png"
cp "$PROCESSED/characters/CHR-C06_Eyes_narrowing,_mouth_"*.png "$DEST/characters/chr_sardor_testing.png"
cp "$PROCESSED/characters/CHR-C06_Man_with_sharp_202604071623.png" "$DEST/characters/chr_sardor_revealing.png"
cp "$PROCESSED/characters/CHR-C06_Professional_approval_nod_"*.png "$DEST/characters/chr_sardor_impressed.png"
cp "$PROCESSED/characters/CHR-C06_Executive_smile_extending_"*.png "$DEST/characters/chr_sardor_satisfied.png"
cp "$PROCESSED/characters/CHR-C06_Man_making_notes_"*.png "$DEST/characters/chr_sardor_testing_notes.png"
cp "$PROCESSED/characters/CHR-C06_Man_with_sharp_202604071623_2.png" "$DEST/characters/chr_sardor_observing.png"
cp "$PROCESSED/characters/CHR-C06_Neutral_expression_pleasant_202604071623_2.png" "$DEST/characters/chr_sardor_neutral_alt.png"
echo "  ✓ Sardor (8 emotions)"

echo "=== Copying Cars (from processed PNGs with transparent bg) ==="
cp "$PROCESSED/cars/CAR-01.png" "$DEST/cars/car_cobalt.png"
cp "$PROCESSED/cars/CAR-02.png" "$DEST/cars/car_tracker.png"
cp "$PROCESSED/cars/CAR-03.png" "$DEST/cars/car_equinox.png"
cp "$PROCESSED/cars/CAR-04.png" "$DEST/cars/car_malibu.png"
cp "$PROCESSED/cars/CAR-05.png" "$DEST/cars/car_tahoe.png"
cp "$PROCESSED/cars/Five_Chevrolet_vehicles_"*.png "$DEST/cars/car_all_lineup.png"
echo "  ✓ 6 cars"

echo "=== Copying UI Illustrations ==="
cp "$SRC/06-ui-illustrations/UI-01.jpeg" "$DEST/ui/ui_product_select.jpg"
cp "$SRC/06-ui-illustrations/UI-02.jpeg" "$DEST/ui/ui_character_select_male.jpg"
cp "$SRC/06-ui-illustrations/UI-03.jpeg" "$DEST/ui/ui_character_select_female.jpg"
cp "$SRC/06-ui-illustrations/UI-04.jpeg" "$DEST/ui/ui_day_summary_success.jpg"
cp "$SRC/06-ui-illustrations/UI-05.jpeg" "$DEST/ui/ui_day_summary_failure.jpg"
cp "$SRC/06-ui-illustrations/Car_key_with_"*.jpeg "$DEST/ui/ui_car_key_icon.jpg"
cp "$SRC/06-ui-illustrations/Golden_vehicle_piece_"*.jpeg "$DEST/ui/ui_vehicle_piece_icon.jpg"
echo "  ✓ 7 UI illustrations"

echo ""
echo "=== DONE ==="
echo "Total files:"
find "$DEST" -type f | wc -l
echo ""
echo "Structure:"
find "$DEST" -type f | sort
