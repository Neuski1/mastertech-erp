-- ================================================================
-- Inventory import: ACTIVE_INVENTORY_REPORT_3-23-26.xlsx
-- Cleaned: duplicates merged, categories assigned, negatives zeroed
-- Deleted: WIDGET, GIG, BAMBI REPLACEMENT MATTRESS, 154A (INC M/C PC RECT)
-- Updated: 08-1097 description appended with FAUCET
--          2GWH-19 GIRARD PROD categorized as HVAC (water heater part)
-- Safe insert: skips parts already in inventory by part_number OR description
-- ================================================================

BEGIN;

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24', '7X120 Arctic Center Radius', 'HARDWARE', 'TORK', '24', 0, 31.2, 62.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24' OR UPPER(description) = '7X120 ARCTIC CENTER RADIUS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '113', 'Water Valve Kit, Plastic Rv Camper Toile', 'MISC/SHOP SUPPLIES', 'AMAZN', '385311641', 2, 0.0, 33.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '113' OR UPPER(description) = 'WATER VALVE KIT, PLASTIC RV CAMPER TOILE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '123', 'Used Black Plastic Knob For Power Vent', 'HVAC', 'TORK', '123', 0, 2.0, 6.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '123' OR UPPER(description) = 'USED BLACK PLASTIC KNOB FOR POWER VENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '148', 'Epoxy Red/Black Terminal For Battery', 'MISC/SHOP SUPPLIES', 'TORK', '148', 0, 4.41, 8.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '148' OR UPPER(description) = 'EPOXY RED/BLACK TERMINAL FOR BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '253', '7-Way Trailer Plug', 'MISC/SHOP SUPPLIES', 'NTP', '253', 0, 0.0, 38.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '253' OR UPPER(description) = '7-WAY TRAILER PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1875338', 'Sail Switch', 'MISC/SHOP SUPPLIES', 'NTP', '36165', 2, 25.09, 34.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1875338' OR UPPER(description) = 'SAIL SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '422', 'Heating Element # 3850644422 For Dometic Refrigera', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 31.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '422' OR UPPER(description) = 'HEATING ELEMENT # 3850644422 FOR DOMETIC REFRIGERA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '571', 'Vacuum Breaker Flush Check Valve', 'MISC/SHOP SUPPLIES', 'TORK', '571', 0, 18.79, 37.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '571' OR UPPER(description) = 'VACUUM BREAKER FLUSH CHECK VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '964', 'The Hillman Group The Hillman Group 964 Marine Cot', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 11.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '964' OR UPPER(description) = 'THE HILLMAN GROUP THE HILLMAN GROUP 964 MARINE COT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1018', 'Lower Wire Loom Kit Zamp', 'MISC/SHOP SUPPLIES', 'GOPOW', '1018', 0, 0.0, 69.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1018' OR UPPER(description) = 'LOWER WIRE LOOM KIT ZAMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1033', 'Auto Marine Rubber Seal', 'MISC/SHOP SUPPLIES', 'TORK', '1033', 0, 14.89, 29.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1033' OR UPPER(description) = 'AUTO MARINE RUBBER SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1157', '1157 Bulb', 'MISC/SHOP SUPPLIES', '.....', '1157', 0, 2.29, 6.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1157' OR UPPER(description) = '1157 BULB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1216.1015', 'Sewer Termination Cap', 'MISC/SHOP SUPPLIES', 'AMAZO', '1216.1015', 2, 4.98, 9.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1216.1015' OR UPPER(description) = 'SEWER TERMINATION CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1233', 'Rec Pro Sending Unit', 'MISC/SHOP SUPPLIES', '.....', '1233', 0, 2.31, 6.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1233' OR UPPER(description) = 'REC PRO SENDING UNIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1234', 'Tank Probs M3/8N Rec Pro', 'MISC/SHOP SUPPLIES', '.....', '12334', 0, 1.97, 5.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1234' OR UPPER(description) = 'TANK PROBS M3/8N REC PRO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1240', 'Trailer Hitch Ball', 'MISC/SHOP SUPPLIES', 'TORK', '1240', 0, 19.47, 25.31, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1240' OR UPPER(description) = 'TRAILER HITCH BALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2023', 'Brake-A-Way Switch With Lanyard', 'MISC/SHOP SUPPLIES', 'TORK', '2023', 0, 15.89, 31.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2023' OR UPPER(description) = 'BRAKE-A-WAY SWITCH WITH LANYARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2218', 'Brake-A-Way Switch', 'MISC/SHOP SUPPLIES', 'TORK', '2218', 0, 1599.0, 2078.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2218' OR UPPER(description) = 'BRAKE-A-WAY SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2349', '-50 Rv Antifreeze', 'MISC/SHOP SUPPLIES', 'TORK', '2349', 0, 0.0, 6.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2349' OR UPPER(description) = '-50 RV ANTIFREEZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2349', 'Antifreeze', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 8, 3.98, 7.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2349' OR UPPER(description) = 'ANTIFREEZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3206', '14/2 Gauge Cover Wire', 'MISC/SHOP SUPPLIES', 'AMAZO', '3206', 0, 55.99, 78.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3206' OR UPPER(description) = '14/2 GAUGE COVER WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4552', 'Adseal White', 'MISC/SHOP SUPPLIES', 'ADFAS', '4552', 0, 23.78, 23.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4552' OR UPPER(description) = 'ADSEAL WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4553', 'Adseal Black', 'MISC/SHOP SUPPLIES', 'ADFAS', '4553', 20, 11.9, 23.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4553' OR UPPER(description) = 'ADSEAL BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4558', 'Adseal Grey  Anodized Aluminum', 'MISC/SHOP SUPPLIES', 'ADFAS', '365330-02', 2, 11.87, 23.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4558' OR UPPER(description) = 'ADSEAL GREY  ANODIZED ALUMINUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5005', '40 Pack L Bracket Corner Braces', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 31.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5005' OR UPPER(description) = '40 PACK L BRACKET CORNER BRACES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5183', 'Battery Terminal Fuse 100-Am', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 3, 0.0, 24.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5183' OR UPPER(description) = 'BATTERY TERMINAL FUSE 100-AM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6007', '4 Position Battery Cutoff Switch', 'MISC/SHOP SUPPLIES', '.....', '6007', 0, 38.92, 58.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6007' OR UPPER(description) = '4 POSITION BATTERY CUTOFF SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6382', '3" Slide Valve', 'MISC/SHOP SUPPLIES', 'TORK', '6382', 0, 18.26, 31.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6382' OR UPPER(description) = '3" SLIDE VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9014', 'Battery Box Strap Vynal', 'MISC/SHOP SUPPLIES', 'TORK', '9014', 0, 4.75, 9.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9014' OR UPPER(description) = 'BATTERY BOX STRAP VYNAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9588', 'Power Inlet W/ Connector 50A 125/250V Electrical', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 54.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9588' OR UPPER(description) = 'POWER INLET W/ CONNECTOR 50A 125/250V ELECTRICAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9918', '100 Amp Buss Fuse', 'MISC/SHOP SUPPLIES', 'TORK', '9918', 0, 16.26, 32.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9918' OR UPPER(description) = '100 AMP BUSS FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10005', 'Oil Tacky Red', 'MISC/SHOP SUPPLIES', 'IRON', '10005', 0, 6.96, 13.92, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10005' OR UPPER(description) = 'OIL TACKY RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10111', '1 Inch Black Vinyl', 'HARDWARE', 'TORK', '10111', 0, 12.74, 25.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10111' OR UPPER(description) = '1 INCH BLACK VINYL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10606', 'Multi Purpose Rug', 'MISC/SHOP SUPPLIES', 'TORK', '10606', 0, 19.23, 38.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10606' OR UPPER(description) = 'MULTI PURPOSE RUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10961', 'Suburban Rear Left Stove Burner', 'MISC/SHOP SUPPLIES', 'TORK', '10961', 0, 53.0, 84.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10961' OR UPPER(description) = 'SUBURBAN REAR LEFT STOVE BURNER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11020', 'Fresh Water Tank New Fittings', 'MISC/SHOP SUPPLIES', 'TMC', '11020', 0, 16.5, 33.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11020' OR UPPER(description) = 'FRESH WATER TANK NEW FITTINGS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11086', '12" Wheel Seal Tripple Lip  S O', 'MISC/SHOP SUPPLIES', '.....', '11086', 0, 6.78, 16.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11086' OR UPPER(description) = '12" WHEEL SEAL TRIPPLE LIP  S O');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12334', '3/8 Window Wedge Seal', 'MISC/SHOP SUPPLIES', 'TORK', '12334', 0, 1.97, 5.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12334' OR UPPER(description) = '3/8 WINDOW WEDGE SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12525', 'Illuminated 12V On/Off Switch', 'MISC/SHOP SUPPLIES', 'NTP', '12525', 0, 5.63, 9.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12525' OR UPPER(description) = 'ILLUMINATED 12V ON/OFF SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14286', 'Drums 6 Lug Inc. Bearings&Seals', 'MISC/SHOP SUPPLIES', '.....', '14286', 0, 67.38, 134.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14286' OR UPPER(description) = 'DRUMS 6 LUG INC. BEARINGS&SEALS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15123', 'Timkin Outter Bearing', 'MISC/SHOP SUPPLIES', 'TORK', '15123', 0, 13.99, 27.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15123' OR UPPER(description) = 'TIMKIN OUTTER BEARING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '16816', 'Swivel Elbow, 0.5" Size', 'PLUMBING', 'AMAZN', '742979168168', 10, 5.56, 9.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '16816' OR UPPER(description) = 'SWIVEL ELBOW, 0.5" SIZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19931', 'Shade/Screen Combo', 'MISC/SHOP SUPPLIES', 'TORK', '19931', 0, 214.52, 300.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19931' OR UPPER(description) = 'SHADE/SCREEN COMBO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20048', 'Harness 11'' Rv Plug', 'MISC/SHOP SUPPLIES', 'IRON', '20048', 0, 50.9, 86.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20048' OR UPPER(description) = 'HARNESS 11'' RV PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '21200', '3M Fastbond Contact Cement 5 Gallon Pail', 'MISC/SHOP SUPPLIES', 'ETRAI', '21200', 0, 488.3, 634.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '21200' OR UPPER(description) = '3M FASTBOND CONTACT CEMENT 5 GALLON PAIL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22223', 'Drain Valve 3/8" Or 1/2" Barb W/Flange (E/F)Llc', 'MISC/SHOP SUPPLIES', 'CAMCO', '', 0, 9.22, 6.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22223' OR UPPER(description) = 'DRAIN VALVE 3/8" OR 1/2" BARB W/FLANGE (E/F)LLC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23035', 'Trailer Jack Base Pad', 'MISC/SHOP SUPPLIES', 'TORK', '23035', 0, 10.53, 21.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23035' OR UPPER(description) = 'TRAILER JACK BASE PAD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24028', 'Bal Lo Pro Scissors Jackcrank', 'MISC/SHOP SUPPLIES', '.....', '24028', 0, 23.99, 40.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24028' OR UPPER(description) = 'BAL LO PRO SCISSORS JACKCRANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24130', 'Barker  12V. Volt Valve', 'MISC/SHOP SUPPLIES', 'TORK', '24130', 0, 123.03, 172.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24130' OR UPPER(description) = 'BARKER  12V. VOLT VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '25219', 'Permatex 25219 Fast Orange Pumice Lotion Hand Clea', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 15.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '25219' OR UPPER(description) = 'PERMATEX 25219 FAST ORANGE PUMICE LOTION HAND CLEA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '25580', 'Timkin Bearing Inner', 'MISC/SHOP SUPPLIES', 'TORK', '25580', 0, 19.98, 39.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '25580' OR UPPER(description) = 'TIMKIN BEARING INNER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30003', 'Basket Strainer 3.5"', 'MISC/SHOP SUPPLIES', 'AMAZO', '30003', 1, 15.59, 31.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30003' OR UPPER(description) = 'BASKET STRAINER 3.5"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30268', 'Atwood Burnerr Head Kit', 'MISC/SHOP SUPPLIES', '.....', '30268', 0, 17.66, 30.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30268' OR UPPER(description) = 'ATWOOD BURNERR HEAD KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30575', 'Dometic Control Board', 'MISC/SHOP SUPPLIES', 'TORK', '30575', 0, 47.09, 94.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30575' OR UPPER(description) = 'DOMETIC CONTROL BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31092', 'Atwood High Temp Limit Switch', 'MISC/SHOP SUPPLIES', 'NTP', '31092', 0, 15.99, 27.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31092' OR UPPER(description) = 'ATWOOD HIGH TEMP LIMIT SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31094', 'Sail Switch Kit Dometic Hydro Flame Corp 31094', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 31.88, 57.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31094' OR UPPER(description) = 'SAIL SWITCH KIT DOMETIC HYDRO FLAME CORP 31094');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31150', 'Dometic Gas Valve Kit', 'MISC/SHOP SUPPLIES', '.....', '31150', 0, 81.78, 122.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31150' OR UPPER(description) = 'DOMETIC GAS VALVE KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31501', 'Atwood 31501 Circuit Board', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 139.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31501' OR UPPER(description) = 'ATWOOD 31501 CIRCUIT BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31705', 'Toilet Valve', 'MISC/SHOP SUPPLIES', 'LIPPE', '31705', 2, 24.79, 58.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31705' OR UPPER(description) = 'TOILET VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '32300', 'Water Tank & System Flush Star Brite Aqua', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 3, 35.2, 44.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '32300' OR UPPER(description) = 'WATER TANK & SYSTEM FLUSH STAR BRITE AQUA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33001', 'Furnace Access Door Dometic Black', 'MISC/SHOP SUPPLIES', 'DOM', '', 1, 0.0, 166.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33001' OR UPPER(description) = 'FURNACE ACCESS DOOR DOMETIC BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33057', 'Furnace Service Door', 'MISC/SHOP SUPPLIES', 'TORK', '33057', 0, 64.66, 96.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33057' OR UPPER(description) = 'FURNACE SERVICE DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33058', 'Dometic Furnace Access Door Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '33058', 0, 70.09, 140.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33058' OR UPPER(description) = 'DOMETIC FURNACE ACCESS DOOR ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33081', 'Sail Switch Dometic 33081 Kit Svc', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 36.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33081' OR UPPER(description) = 'SAIL SWITCH DOMETIC 33081 KIT SVC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33082', 'Sail Switch With Upgraded Bracket K', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 32.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33082' OR UPPER(description) = 'SAIL SWITCH WITH UPGRADED BRACKET K');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33239', 'Flange Seal', 'MISC/SHOP SUPPLIES', '.....', '33239', 0, 8.0, 16.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33239' OR UPPER(description) = 'FLANGE SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33488', 'Circuit Board', 'MISC/SHOP SUPPLIES', 'TORK', '33488', 0, 42.0, 84.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33488' OR UPPER(description) = 'CIRCUIT BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33613', '100 Amp Super Fuse', 'MISC/SHOP SUPPLIES', 'AMAZO', '33613', 0, 27.65, 55.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33613' OR UPPER(description) = '100 AMP SUPER FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33861', 'Thetford Aqua Majic Rv Toilet', 'MISC/SHOP SUPPLIES', '.....', '33861', 0, 156.07, 218.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33861' OR UPPER(description) = 'THETFORD AQUA MAJIC RV TOILET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '34570', 'Atwood Electrode', 'MISC/SHOP SUPPLIES', '.....', '34570', 0, 31.35, 62.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '34570' OR UPPER(description) = 'ATWOOD ELECTRODE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '35524', 'Dometic Furnace', 'MISC/SHOP SUPPLIES', 'TORK', '35524', 0, 1097.49, 1536.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '35524' OR UPPER(description) = 'DOMETIC FURNACE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '36272', '1.50" Exhaust Hanger', 'MISC/SHOP SUPPLIES', 'AMAZO', '36272', 0, 8.79, 9.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '36272' OR UPPER(description) = '1.50" EXHAUST HANGER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '38453', 'Dometic Heat Only Thermostat', 'MISC/SHOP SUPPLIES', 'AMAZO', '38453', 0, 29.99, 50.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '38453' OR UPPER(description) = 'DOMETIC HEAT ONLY THERMOSTAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '40030', 'Curt. 2 5/16" Ball', 'MISC/SHOP SUPPLIES', 'LIPPE', '40030', 0, 0.0, 35.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '40030' OR UPPER(description) = 'CURT. 2 5/16" BALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '40072', 'Shop Rags', 'MISC/SHOP SUPPLIES', 'TORK', '40072', 0, 4.1, 6.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '40072' OR UPPER(description) = 'SHOP RAGS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42058', 'Thetford Aqua Magic Ii High White', 'MISC/SHOP SUPPLIES', 'AMAZO', '42058', 0, 190.49, 266.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42058' OR UPPER(description) = 'THETFORD AQUA MAGIC II HIGH WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42072', 'Dexter Axle', 'MISC/SHOP SUPPLIES', 'IRON', '42072', 0, 441.59, 750.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42072' OR UPPER(description) = 'DEXTER AXLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42163', 'Refrigerator Vent Cover  Cover Only  Black', 'MISC/SHOP SUPPLIES', 'CAMCO', '', 0, 28.23, 28.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42163' OR UPPER(description) = 'REFRIGERATOR VENT COVER  COVER ONLY  BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42173', 'Grab Handle  Gray  Clamshell', 'MISC/SHOP SUPPLIES', 'CAMCO', '', 0, 0.0, 9.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42173' OR UPPER(description) = 'GRAB HANDLE  GRAY  CLAMSHELL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '44665', '10" Fifth Wheel Lube Plate (E/F) Pdq', 'MISC/SHOP SUPPLIES', 'CAMCO', '', 0, 4.08, 16.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '44665' OR UPPER(description) = '10" FIFTH WHEEL LUBE PLATE (E/F) PDQ');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '45538', 'Galvanized Gray Adseal Sealant Tube', 'MISC/SHOP SUPPLIES', 'TORK', '45538', 0, 11.9, 16.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '45538' OR UPPER(description) = 'GALVANIZED GRAY ADSEAL SEALANT TUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '46314', 'Wheel Seal', 'MISC/SHOP SUPPLIES', 'AMAZO', '2026-10-19 00:00:00', 14, 1.3, 4.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '46314' OR UPPER(description) = 'WHEEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '47063', 'Heater Hose Elbow', 'MISC/SHOP SUPPLIES', 'AMAZO', '47063', 0, 6.36, 8.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '47063' OR UPPER(description) = 'HEATER HOSE ELBOW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '49949', 'Wheel Seals 2.25" X3.376" 20 Seals/Sleeve', 'MISC/SHOP SUPPLIES', 'IRON', '2036-10-01 00:00:00', 4, 2.44, 5.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '49949' OR UPPER(description) = 'WHEEL SEALS 2.25" X3.376" 20 SEALS/SLEEVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '50602', 'Female City Water Inlet', 'MISC/SHOP SUPPLIES', 'CMP W', '', 1, 0.0, 32.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '50602' OR UPPER(description) = 'FEMALE CITY WATER INLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '51180', 'Curt 51180 Echo Mobile Electric Trailer Brake Cont', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 349.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '51180' OR UPPER(description) = 'CURT 51180 ECHO MOBILE ELECTRIC TRAILER BRAKE CONT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '53180', '180 Watt Monocrystalline Solar Panel Nature Power', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 250.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '53180' OR UPPER(description) = '180 WATT MONOCRYSTALLINE SOLAR PANEL NATURE POWER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '54155', 'Sky Light Outer Frame', 'MISC/SHOP SUPPLIES', 'TORK', '54155', 0, 90.99, 127.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '54155' OR UPPER(description) = 'SKY LIGHT OUTER FRAME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '55046', 'Dc Power Reversing Switch', 'MISC/SHOP SUPPLIES', 'E&G', '732-55046', 0, 0.0, 44.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '55046' OR UPPER(description) = 'DC POWER REVERSING SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '58102', 'Titan Sleeve Reuces Tube 2.5" To A 2" Square', 'HARDWARE', 'IRON', '', 1, 0.0, 26.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '58102' OR UPPER(description) = 'TITAN SLEEVE REUCES TUBE 2.5" TO A 2" SQUARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '62010', 'Mastercool 62010 Gray/Yellow 30 Lb Refrigerant Rec', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 144.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '62010' OR UPPER(description) = 'MASTERCOOL 62010 GRAY/YELLOW 30 LB REFRIGERANT REC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '76116', 'Rubber Seal Coditioner', 'MISC/SHOP SUPPLIES', 'TORK', '76116', 0, 9.96, 29.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '76116' OR UPPER(description) = 'RUBBER SEAL CODITIONER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '78220', 'Gopower Retreat 100 Watt Solar Expansion Kit', 'MISC/SHOP SUPPLIES', '.....', '78220', 0, 143.87, 201.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '78220' OR UPPER(description) = 'GOPOWER RETREAT 100 WATT SOLAR EXPANSION KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '82510', 'Moen Valve Assembly Cartridge', 'MISC/SHOP SUPPLIES', 'TORK', '82510', 0, 128.31, 179.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '82510' OR UPPER(description) = 'MOEN VALVE ASSEMBLY CARTRIDGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84226', 'Victron Dc To Dc Charger', 'MISC/SHOP SUPPLIES', 'AMAZO', 'VICTRON ENERGY', 0, 0.0, 317.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84226' OR UPPER(description) = 'VICTRON DC TO DC CHARGER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '88181', 'Sewer Vent White', 'MISC/SHOP SUPPLIES', 'TORK', '88181', 0, 5.91, 11.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '88181' OR UPPER(description) = 'SEWER VENT WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '88188', 'Danco 1 1/12" Abs Tub Trap', 'MISC/SHOP SUPPLIES', 'AMAZO', '88188', 1, 10.46, 15.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '88188' OR UPPER(description) = 'DANCO 1 1/12" ABS TUB TRAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90011', 'Young Marine 25 Amp Breaker', 'MISC/SHOP SUPPLIES', '.....', '90011', 0, 22.19, 44.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90011' OR UPPER(description) = 'YOUNG MARINE 25 AMP BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90029', 'Mixing Valve Xt Series', 'MISC/SHOP SUPPLIES', 'AMAZO', '90029', 0, 108.99, 152.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90029' OR UPPER(description) = 'MIXING VALVE XT SERIES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90106', 'Zebra Pens, Bulk Pack Of 24 Ink Pens, Z-Grip Retra', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 15.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90106' OR UPPER(description) = 'ZEBRA PENS, BULK PACK OF 24 INK PENS, Z-GRIP RETRA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '91959', 'Dometic Heater Switch -Atwood', 'MISC/SHOP SUPPLIES', 'AMAZO', '91959', 1, 17.98, 25.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '91959' OR UPPER(description) = 'DOMETIC HEATER SWITCH -ATWOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '92097', 'Atwood Heating Element', 'MISC/SHOP SUPPLIES', 'TORK', '92097', 0, 18.55, 37.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '92097' OR UPPER(description) = 'ATWOOD HEATING ELEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '93866', 'Thermal Cut Off Kit For Rv Atwood 93866 Water Heat', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 16.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '93866' OR UPPER(description) = 'THERMAL CUT OFF KIT FOR RV ATWOOD 93866 WATER HEAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '93870', 'Atwood Gas Valve', 'MISC/SHOP SUPPLIES', 'TORK', '93870', 0, 69.33, 138.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '93870' OR UPPER(description) = 'ATWOOD GAS VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '94010', 'Water Heater Door Dometic', 'MISC/SHOP SUPPLIES', 'AMAZO', '94010', 0, 31.0, 79.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '94010' OR UPPER(description) = 'WATER HEATER DOOR DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '94067', 'Dometic 6 Gal Door Svc Kit', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 157.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '94067' OR UPPER(description) = 'DOMETIC 6 GAL DOOR SVC KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '94203', 'Rv Camper Exterior Outdoor Shower Hot/Cold Water M', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 25.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '94203' OR UPPER(description) = 'RV CAMPER EXTERIOR OUTDOOR SHOWER HOT/COLD WATER M');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '94215', 'Water Flange', 'MISC/SHOP SUPPLIES', '.....', '94215', 0, 15.99, 31.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '94215' OR UPPER(description) = 'WATER FLANGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '96010', 'Atwood Ring And Gasket Kit', 'MISC/SHOP SUPPLIES', 'AMAZO', 'X003N26RDH', 0, 0.0, 34.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '96010' OR UPPER(description) = 'ATWOOD RING AND GASKET KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '97016', 'Water Treatment & Freshener Star Brite Aqua', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 23.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '97016' OR UPPER(description) = 'WATER TREATMENT & FRESHENER STAR BRITE AQUA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '97116', 'Water Shock - 16 Oz (097116) Star Brite Aqua', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 22.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '97116' OR UPPER(description) = 'WATER SHOCK - 16 OZ (097116) STAR BRITE AQUA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '100589', 'Ss Clamp', 'PLUMBING', 'HDPOT', '', 0, 1.85, 2.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '100589' OR UPPER(description) = 'SS CLAMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '101222', 'Handy Box Duplex Recep Cover', 'ELECTRICAL', 'HDPOT', '202590846', 0, 0.98, 1.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '101222' OR UPPER(description) = 'HANDY BOX DUPLEX RECEP COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '101311', '2-1/8 Hdy Bx Flt Brkt 1/2 Ko', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 5.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '101311' OR UPPER(description) = '2-1/8 HDY BX FLT BRKT 1/2 KO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '102357', 'Stiffner Bracket', 'MISC/SHOP SUPPLIES', 'TORK', '102357', 0, 8.53, 17.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '102357' OR UPPER(description) = 'STIFFNER BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '103078', '1/2 2X4 Sande Plywood', 'HARDWARE', 'HDPOT', '202093791', 0, 27.98, 39.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '103078' OR UPPER(description) = '1/2 2X4 SANDE PLYWOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '103480', 'Wear Tabs', 'MISC/SHOP SUPPLIES', 'TORK', '103480', 0, 2.19, 5.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '103480' OR UPPER(description) = 'WEAR TABS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '104600', 'Skylight Kit 14X22', 'MISC/SHOP SUPPLIES', 'TORK', '104600', 0, 0.0, 142.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '104600' OR UPPER(description) = 'SKYLIGHT KIT 14X22');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '106124', 'Ang 1.5 X 4 X 12.25', 'HARDWARE', '.....', '106124', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '106124' OR UPPER(description) = 'ANG 1.5 X 4 X 12.25');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '109218', '10-2 Nm W/G Copper /Foot', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 5.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '109218' OR UPPER(description) = '10-2 NM W/G COPPER /FOOT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '109642', 'Camco Tongue Jack Cover', 'MISC/SHOP SUPPLIES', 'TORK', '109642', 0, 10.99, 21.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '109642' OR UPPER(description) = 'CAMCO TONGUE JACK COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '109878', 'Gorrilla Wood Filler', 'MISC/SHOP SUPPLIES', 'TORK', '109878', 0, 9.21, 13.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '109878' OR UPPER(description) = 'GORRILLA WOOD FILLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114328', 'Extrusion Beltline Molding 16'' Pc', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 2.38, 3.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114328' OR UPPER(description) = 'EXTRUSION BELTLINE MOLDING 16'' PC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114888', 'Airstream Center Front Segment', 'MISC/SHOP SUPPLIES', 'INTER', '114888', 1, 565.45, 821.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114888' OR UPPER(description) = 'AIRSTREAM CENTER FRONT SEGMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114889', 'Segment Center Right "Bright" Cs Rear  Rs Front', 'MISC/SHOP SUPPLIES', 'INTER', '114889', 0, 517.99, 805.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114889' OR UPPER(description) = 'SEGMENT CENTER RIGHT "BRIGHT" CS REAR  RS FRONT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114890', 'Segment #26 "Bright"', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 564.45, 790.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114890' OR UPPER(description) = 'SEGMENT #26 "BRIGHT"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114891', 'Airstream Upper Corner Front Segment', 'MISC/SHOP SUPPLIES', 'INTER', '114891', 1, 564.45, 806.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114891' OR UPPER(description) = 'AIRSTREAM UPPER CORNER FRONT SEGMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114893', 'Airstream Center Top Roof Segment', 'MISC/SHOP SUPPLIES', 'WOODL', '114893', 0, 0.0, 895.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114893' OR UPPER(description) = 'AIRSTREAM CENTER TOP ROOF SEGMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114894', 'Segment #28 "Bright"', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 564.45, 791.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114894' OR UPPER(description) = 'SEGMENT #28 "BRIGHT"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114895', 'Segment #29 "Bright"', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 564.45, 791.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114895' OR UPPER(description) = 'SEGMENT #29 "BRIGHT"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115112', 'Camco Propane Tank Cover Black', 'MISC/SHOP SUPPLIES', 'TORK', '115112', 0, 28.99, 40.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115112' OR UPPER(description) = 'CAMCO PROPANE TANK COVER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115207', 'Bambi Sport Door With Lock', 'MISC/SHOP SUPPLIES', 'CAMCO', '115207', 0, 2322.82, 2903.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115207' OR UPPER(description) = 'BAMBI SPORT DOOR WITH LOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115546', 'Extrusion Rubrail Trl', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 0.0, 5.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115546' OR UPPER(description) = 'EXTRUSION RUBRAIL TRL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115733', 'Z-Extrusion, Rear Floor Cs', 'MISC/SHOP SUPPLIES', 'CAMCO', '115733', 0, 6.98, 13.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115733' OR UPPER(description) = 'Z-EXTRUSION, REAR FLOOR CS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115738', 'Horizontal Wheel Well Brace, Cs', 'MISC/SHOP SUPPLIES', 'CAMCO', '115738', 0, 18.99, 37.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115738' OR UPPER(description) = 'HORIZONTAL WHEEL WELL BRACE, CS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '118972', '4-11/16 Blank Cover', 'ELECTRICAL', 'HDPOT', '100564950', 0, 1.7, 2.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '118972' OR UPPER(description) = '4-11/16 BLANK COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '125293', '1G Wht Jumbo Decora Wallplt', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 2.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '125293' OR UPPER(description) = '1G WHT JUMBO DECORA WALLPLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '137960', 'Econ 9 X 3/8 In Knit Poly Roller 6Pk', 'MISC/SHOP SUPPLIES', 'HDPOT', '', 0, 0.0, 13.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '137960' OR UPPER(description) = 'ECON 9 X 3/8 IN KNIT POLY ROLLER 6PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '138469', 'Silver Trim Transition', 'MISC/SHOP SUPPLIES', '.....', '138469', 0, 15.77, 31.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '138469' OR UPPER(description) = 'SILVER TRIM TRANSITION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '150880', 'Jayco Decal #2', 'MISC/SHOP SUPPLIES', '.....', '150880', 0, 39.26, 51.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '150880' OR UPPER(description) = 'JAYCO DECAL #2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '161154', 'Suburban Wall Thermostat', 'MISC/SHOP SUPPLIES', 'AMAZO', '161154', 0, 24.99, 49.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '161154' OR UPPER(description) = 'SUBURBAN WALL THERMOSTAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '161640', '2X4-96 Kd-Ht', 'HARDWARE', 'HDPOT', '', 0, 4.75, 6.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '161640' OR UPPER(description) = '2X4-96 KD-HT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '163859', 'Front Metal Bottom Sheet', 'MISC/SHOP SUPPLIES', '.....', '163859', 0, 896.92, 1166.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '163859' OR UPPER(description) = 'FRONT METAL BOTTOM SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '167254', 'Jayco Decal #5', 'MISC/SHOP SUPPLIES', '.....', '167254', 0, 41.17, 53.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '167254' OR UPPER(description) = 'JAYCO DECAL #5');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '167636', 'Teks Hwh Drill Pt Screw 12X2" 60Pk', 'HARDWARE', 'HDPOT', '', 0, 0.0, 13.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '167636' OR UPPER(description) = 'TEKS HWH DRILL PT SCREW 12X2" 60PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '169222', 'Jayco Decal #7', 'MISC/SHOP SUPPLIES', '.....', '169222', 0, 28.25, 36.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '169222' OR UPPER(description) = 'JAYCO DECAL #7');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '187984', '1" Pvc El 90D Sxs', 'PLUMBING', 'HDPOT', '', 0, 0.0, 1.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '187984' OR UPPER(description) = '1" PVC EL 90D SXS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188085', '1" Pvc Coupling Sxs', 'PLUMBING', 'HDPOT', '203811385', 0, 0.91, 1.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188085' OR UPPER(description) = '1" PVC COUPLING SXS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188239', '1-1/2" Abs Coupling Hxh', 'PLUMBING', 'HDPOT', '100344770', 0, 1.23, 2.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188239' OR UPPER(description) = '1-1/2" ABS COUPLING HXH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188255', '3" Abs Coupling Hxh', 'PLUMBING', 'HDPOT', '100342440', 0, 3.66, 5.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188255' OR UPPER(description) = '3" ABS COUPLING HXH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188514', '1-1/2" Abs El 45Deg Hxh', 'PLUMBING', 'HDPOT', '100342515', 0, 2.34, 3.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188514' OR UPPER(description) = '1-1/2" ABS EL 45DEG HXH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188530', '3" Abs El 45Deg Hxh', 'PLUMBING', 'HDPOT', '100342994', 0, 6.22, 8.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188530' OR UPPER(description) = '3" ABS EL 45DEG HXH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188603', '90 Degree Elbow Black  Abs Short Sweep', 'PLUMBING', 'TORK', '188603', 0, 2.75, 8.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188603' OR UPPER(description) = '90 DEGREE ELBOW BLACK  ABS SHORT SWEEP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '289477', 'Abs El', 'PLUMBING', 'HDPOT', '', 0, 0.0, 16.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '289477' OR UPPER(description) = 'ABS EL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188662', 'Abs Elbow 1 1/2" X 90 Long Sweep', 'PLUMBING', 'HDEPO', '188662', 0, 5.74, 11.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188662' OR UPPER(description) = 'ABS ELBOW 1 1/2" X 90 LONG SWEEP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '188867', 'Abs P-Trap 1.5"', 'MISC/SHOP SUPPLIES', 'HDEPO', '188867', 0, 12.32, 24.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '188867' OR UPPER(description) = 'ABS P-TRAP 1.5"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '189507', 'Front Metal 2Ndsheet', 'MISC/SHOP SUPPLIES', '.....', '189507', 0, 135.02, 175.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '189507' OR UPPER(description) = 'FRONT METAL 2NDSHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '189770', 'Jayco Decal #3', 'MISC/SHOP SUPPLIES', '.....', '189770', 0, 38.3, 49.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '189770' OR UPPER(description) = 'JAYCO DECAL #3');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '189846', 'Ce In-Line Ethernet Coupler White', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 9.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '189846' OR UPPER(description) = 'CE IN-LINE ETHERNET COUPLER WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '192181', 'Metal - Skirt - .30 X 11 X 96 - St - 2" Radius - B', 'HARDWARE', 'RENOG', '192181', 0, 59.63, 119.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '192181' OR UPPER(description) = 'METAL - SKIRT - .30 X 11 X 96 - ST - 2" RADIUS - B');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '193789', 'Jm Eagle 1 1/2" Abs Pipe 10'' Foamcore Pipe', 'MISC/SHOP SUPPLIES', 'TORK', '193789', 0, 0.99, 2.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '193789' OR UPPER(description) = 'JM EAGLE 1 1/2" ABS PIPE 10'' FOAMCORE PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '193828', 'Abs Pipe 3" Per Foot', 'PLUMBING', 'HDPOT', '', 0, 0.0, 58.31, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '193828' OR UPPER(description) = 'ABS PIPE 3" PER FOOT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '196583', '20 Amp Circuit Breaker', 'MISC/SHOP SUPPLIES', '.....', '196583', 0, 32.93, 65.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '196583' OR UPPER(description) = '20 AMP CIRCUIT BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '198250', '20 Amp Ge Cuircut Breaker', 'MISC/SHOP SUPPLIES', 'TORK', '198250', 0, 6.98, 20.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '198250' OR UPPER(description) = '20 AMP GE CUIRCUT BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '200394', 'Step Handle', 'MISC/SHOP SUPPLIES', 'TORK', '200394', 0, 0.0, 46.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '200394' OR UPPER(description) = 'STEP HANDLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '201427', 'Awning Motor Assembly 12V', 'MISC/SHOP SUPPLIES', 'ZIPD', '201427', 0, 275.0, 395.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '201427' OR UPPER(description) = 'AWNING MOTOR ASSEMBLY 12V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '201863', '4X1-1/2 Sqbx 1/2&3/4 Ko', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 3.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '201863' OR UPPER(description) = '4X1-1/2 SQBX 1/2&3/4 KO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '201912', 'Rub Rail Chrome Insert 1/2" As', 'MISC/SHOP SUPPLIES', 'AS IE', '201912', 84, 2.93, 5.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '201912' OR UPPER(description) = 'RUB RAIL CHROME INSERT 1/2" AS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '202241', 'Wide Flex Key 17''', 'MISC/SHOP SUPPLIES', 'TORK', '202241', 0, 63.0, 94.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '202241' OR UPPER(description) = 'WIDE FLEX KEY 17''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '202460', 'Carlon Old Work 1G 14Cu', 'ELECTRICAL', 'HDPOT', '100404027', 0, 1.98, 2.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '202460' OR UPPER(description) = 'CARLON OLD WORK 1G 14CU');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '203991', 'Inner Black Wheel Well', 'MISC/SHOP SUPPLIES', 'WOOD', '203991', 0, 269.99, 350.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '203991' OR UPPER(description) = 'INNER BLACK WHEEL WELL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '203993', 'Exterior Wheel Well Arch', 'MISC/SHOP SUPPLIES', 'AS IE', '203993', 0, 263.91, 343.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '203993' OR UPPER(description) = 'EXTERIOR WHEEL WELL ARCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '210050', 'Base Hinge, Triangular Rib Mount', 'MISC/SHOP SUPPLIES', 'ZIPD', '210050', 0, 8.7, 17.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '210050' OR UPPER(description) = 'BASE HINGE, TRIANGULAR RIB MOUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '212062', 'Awning Fabric Replacement - Premium', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 194.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '212062' OR UPPER(description) = 'AWNING FABRIC REPLACEMENT - PREMIUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '212261', '1G Wht Nyl Midway Outlet Wallplt', 'ELECTRICAL', 'HDPOT', '100356815', 0, 0.77, 1.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '212261' OR UPPER(description) = '1G WHT NYL MIDWAY OUTLET WALLPLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '214574', 'Rectanglar Blank Cvr Slvr Jlq84', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 1.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '214574' OR UPPER(description) = 'RECTANGLAR BLANK CVR SLVR JLQ84');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '217659', 'Hex Bolt Zinc 5/16 X 3-1/2 (Ase)', 'HARDWARE', 'HDPOT', '', 0, 0.0, 1.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '217659' OR UPPER(description) = 'HEX BOLT ZINC 5/16 X 3-1/2 (ASE)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '218610', 'Contour Zip Dee Claw Bar Replacement', 'MISC/SHOP SUPPLIES', 'TORK', '218610', 0, 46.29, 92.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '218610' OR UPPER(description) = 'CONTOUR ZIP DEE CLAW BAR REPLACEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '220003', 'Airstream Gabriel Shock Absorber', 'MISC/SHOP SUPPLIES', 'AS IE', '220003', 6, 41.51, 66.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '220003' OR UPPER(description) = 'AIRSTREAM GABRIEL SHOCK ABSORBER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '221736', 'Tan Awning Fabric- Shadepro', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 236.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '221736' OR UPPER(description) = 'TAN AWNING FABRIC- SHADEPRO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '221835', 'Shadepro Awning Fabric', 'MISC/SHOP SUPPLIES', 'TORK', '221835', 0, 179.0, 250.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '221835' OR UPPER(description) = 'SHADEPRO AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '223673', '1G Wht Duplex Wallplt', 'ELECTRICAL', 'HDPOT', '100025171', 0, 0.45, 0.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '223673' OR UPPER(description) = '1G WHT DUPLEX WALLPLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '231738', 'Moen Shower Faucet', 'MISC/SHOP SUPPLIES', 'TORK', '231738', 0, 169.0, 221.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '231738' OR UPPER(description) = 'MOEN SHOWER FAUCET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '231933', 'Electrode', 'MISC/SHOP SUPPLIES', 'TORK', '231933', 0, 0.0, 36.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '231933' OR UPPER(description) = 'ELECTRODE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '232259', 'Water Heater Element Switch', 'MISC/SHOP SUPPLIES', 'AMAZO', '232259', 0, 7.99, 11.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '232259' OR UPPER(description) = 'WATER HEATER ELEMENT SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '232521', 'Abs Reducer 3 X 1 1/2" Hub To Hub', 'MISC/SHOP SUPPLIES', '.....', '232521', 0, 8.69, 17.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '232521' OR UPPER(description) = 'ABS REDUCER 3 X 1 1/2" HUB TO HUB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '232767', 'Anoderod Suburban  Wh', 'PLUMBING', 'AMAZO', '232767', 0, 13.99, 25.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '232767' OR UPPER(description) = 'ANODEROD SUBURBAN  WH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '234154', 'Heating/Cooling Register Black', 'MISC/SHOP SUPPLIES', 'NTP', '02-29145', 2, 5.75, 12.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '234154' OR UPPER(description) = 'HEATING/COOLING REGISTER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '236575', 'Lippert Slide Motor', 'MISC/SHOP SUPPLIES', 'TORK', '236575', 0, 257.29, 360.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '236575' OR UPPER(description) = 'LIPPERT SLIDE MOTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '240661', 'Frog Tape 3 Rolls', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 58.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '240661' OR UPPER(description) = 'FROG TAPE 3 ROLLS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '246375', 'Diablo 5" Ros Disc H&L 80G 50Pk', 'HARDWARE', 'HDPOT', '', 0, 0.0, 27.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '246375' OR UPPER(description) = 'DIABLO 5" ROS DISC H&L 80G 50PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '254977', '1"X2'' Pvc Pipe', 'PLUMBING', 'HDPOT', '', 0, 0.0, 7.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '254977' OR UPPER(description) = '1"X2'' PVC PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '261327', 'Jayco Decal A', 'MISC/SHOP SUPPLIES', 'BLUEC', '261327', 0, 28.29, 56.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '261327' OR UPPER(description) = 'JAYCO DECAL A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '261912', 'Contour Hinge Assembly For Awning', 'MISC/SHOP SUPPLIES', 'ZIPD', '261912', 0, 98.0, 146.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '261912' OR UPPER(description) = 'CONTOUR HINGE ASSEMBLY FOR AWNING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '262101', 'Complete Gas Rafter Assemble', 'HVAC', 'TORK', '262101', 0, 873.0, 873.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '262101' OR UPPER(description) = 'COMPLETE GAS RAFTER ASSEMBLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '264133', '1/2" Pex-B Barb Male Adapter', 'MISC/SHOP SUPPLIES', 'HDEPO', '264133', 0, 3.43, 6.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '264133' OR UPPER(description) = '1/2" PEX-B BARB MALE ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '265352', 'Jayco Decal I', 'MISC/SHOP SUPPLIES', 'TORK', '265352', 0, 422.89, 592.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '265352' OR UPPER(description) = 'JAYCO DECAL I');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '266426', '1/2" Pex X 1/2" Female Swiv Adpt Pls', 'PLUMBING', 'HDPOT', '', 0, 0.0, 4.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '266426' OR UPPER(description) = '1/2" PEX X 1/2" FEMALE SWIV ADPT PLS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '266997', '1/2" X 1/2" X 1/2" Pex Tee', 'PLUMBING', 'HDPOT', '301541257', 0, 3.48, 4.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '266997' OR UPPER(description) = '1/2" X 1/2" X 1/2" PEX TEE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '272871', '#4 Metal Polar White 36', 'MISC/SHOP SUPPLIES', 'TORK', '272871', 0, 347.94, 581.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '272871' OR UPPER(description) = '#4 METAL POLAR WHITE 36');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '276250', '#3 Metal Pwtr 24X95', 'MISC/SHOP SUPPLIES', 'BLUEC', '276250', 0, 167.58, 293.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '276250' OR UPPER(description) = '#3 METAL PWTR 24X95');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '279670', 'Old Work 1G 8Cu Shallow', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 2.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '279670' OR UPPER(description) = 'OLD WORK 1G 8CU SHALLOW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '281154', 'Solera 69" Standard Flat Awning Support Arm Assemb', 'MISC/SHOP SUPPLIES', 'ETRAI', '281154', 0, 357.25, 535.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '281154' OR UPPER(description) = 'SOLERA 69" STANDARD FLAT AWNING SUPPORT ARM ASSEMB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '281331', 'Gearpacks', 'MISC/SHOP SUPPLIES', 'TORK', '281331', 0, 67.92, 135.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '281331' OR UPPER(description) = 'GEARPACKS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '293989', '1-1/4" Pvc Coupling Sxs', 'PLUMBING', 'HDPOT', '', 0, 0.0, 1.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '293989' OR UPPER(description) = '1-1/4" PVC COUPLING SXS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '294292', '1 1/2" X 1 1/4 Pvc Reducer', 'MISC/SHOP SUPPLIES', 'TORK', '294292', 0, 2.24, 6.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '294292' OR UPPER(description) = '1 1/2" X 1 1/4 PVC REDUCER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '296039', '4-11/16 Sq Box 1/2 X 3/4 Ko', 'ELECTRICAL', 'HDPOT', '100568338', 0, 6.28, 8.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '296039' OR UPPER(description) = '4-11/16 SQ BOX 1/2 X 3/4 KO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '296090', 'Inner Arms', 'MISC/SHOP SUPPLIES', 'TORK', '296090', 0, 131.49, 191.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '296090' OR UPPER(description) = 'INNER ARMS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '298400', 'Auto Fuse 400A Time D', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 16.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '298400' OR UPPER(description) = 'AUTO FUSE 400A TIME D');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '299344', 'Zip Dee Travel Latch Kit', 'MISC/SHOP SUPPLIES', 'TORK', '299344', 0, 25.5, 51.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '299344' OR UPPER(description) = 'ZIP DEE TRAVEL LATCH KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '299839', 'Handy Box 1 7/8 Dp 1/2 Ko', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 2.41, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '299839' OR UPPER(description) = 'HANDY BOX 1 7/8 DP 1/2 KO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '300532', 'Jayco Decal B', 'MISC/SHOP SUPPLIES', 'BLUEC', '300532', 0, 357.93, 608.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '300532' OR UPPER(description) = 'JAYCO DECAL B');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '302191', '1Odx3/4Idx10'' Br Vinyl Tube', 'PLUMBING', 'HDPOT', '', 0, 0.0, 36.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '302191' OR UPPER(description) = '1ODX3/4IDX10'' BR VINYL TUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '308474', 'Lipper Interior Awning Switch', 'MISC/SHOP SUPPLIES', 'TORK', '308474', 0, 14.95, 29.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '308474' OR UPPER(description) = 'LIPPER INTERIOR AWNING SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '313092', 'Spring Pin 1/4 X 1 1/8 Split Spring', 'MISC/SHOP SUPPLIES', 'ZIPD', '313092', 0, 1.2, 2.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '313092' OR UPPER(description) = 'SPRING PIN 1/4 X 1 1/8 SPLIT SPRING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '318041', 'Universal Joint Ss Solid Id', 'TOWING/CHASSIS', 'ZIPD', '318041', 0, 61.0, 91.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '318041' OR UPPER(description) = 'UNIVERSAL JOINT SS SOLID ID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '318042', 'Universal Joint Ss W/Treaded', 'TOWING/CHASSIS', 'ZIPD', '318042', 0, 83.0, 124.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '318042' OR UPPER(description) = 'UNIVERSAL JOINT SS W/TREADED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '321604', 'Rafter Collar Uhmw 1 3/8 X 3/4', 'MISC/SHOP SUPPLIES', 'ZIPD', '321604', 0, 18.0, 30.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '321604' OR UPPER(description) = 'RAFTER COLLAR UHMW 1 3/8 X 3/4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '324243', '15A Wht Tmpr-Resistant Duplex Outlet', 'ELECTRICAL', 'HDPOT', '100662608', 0, 1.48, 2.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '324243' OR UPPER(description) = '15A WHT TMPR-RESISTANT DUPLEX OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '326192', 'Entry Door Side Screw Cover Trim, Black', 'MISC/SHOP SUPPLIES', 'TORK', '326192', 0, 13.1, 22.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '326192' OR UPPER(description) = 'ENTRY DOOR SIDE SCREW COVER TRIM, BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '327150', 'Air Return Vent 10 X 6 In', 'MISC/SHOP SUPPLIES', 'HDEPO', '327150', 0, 10.47, 20.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '327150' OR UPPER(description) = 'AIR RETURN VENT 10 X 6 IN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '328542', 'Windshield Triangle 2.1Mm Privacy Glass', 'DOORS/WINDOWS/AWNINGS', 'ETRAI', '328542', 0, 663.8, 995.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '328542' OR UPPER(description) = 'WINDSHIELD TRIANGLE 2.1MM PRIVACY GLASS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '330155', 'Rivet - .125" Alum W/Ss Mantrel', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 0.0, 0.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '330155' OR UPPER(description) = 'RIVET - .125" ALUM W/SS MANTREL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '333957', '2200 Lb Wheel Seals', 'MISC/SHOP SUPPLIES', 'AMAZO', '333957', 0, 0.0, 2.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '333957' OR UPPER(description) = '2200 LB WHEEL SEALS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '333961', 'Lippert 333961 Rv And Trailer Axle Grease Seal 350', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 12, 24.73, 8.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '333961' OR UPPER(description) = 'LIPPERT 333961 RV AND TRAILER AXLE GREASE SEAL 350');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '338273', 'Steel Box', 'ELECTRICAL', 'HDPOT', '', 0, 5.54, 7.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '338273' OR UPPER(description) = 'STEEL BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '341195', 'Satin Case Slats - 16Ft', 'MISC/SHOP SUPPLIES', 'ZIPD', '341195', 0, 72.0, 147.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '341195' OR UPPER(description) = 'SATIN CASE SLATS - 16FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '344792', '22 Inch Ground Control  Leveling Jack', 'MISC/SHOP SUPPLIES', '.....', '344792', 0, 400.34, 640.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '344792' OR UPPER(description) = '22 INCH GROUND CONTROL  LEVELING JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '351396', 'Solara Awning Arms W/ Speakers 69"', 'MISC/SHOP SUPPLIES', 'TORK', '351396', 0, 849.99, 1189.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '351396' OR UPPER(description) = 'SOLARA AWNING ARMS W/ SPEAKERS 69"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '362646', 'Ge Sil Ii W&D Clear 10.1 Oz', 'MISC/SHOP SUPPLIES', 'HDPOT', '100026175', 0, 7.58, 10.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '362646' OR UPPER(description) = 'GE SIL II W&D CLEAR 10.1 OZ');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '364331', 'Field Service Kit', 'MISC/SHOP SUPPLIES', 'TORK', '364331', 0, 56.83, 113.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '364331' OR UPPER(description) = 'FIELD SERVICE KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '365222', 'Black Body Segment Seam Tape', 'MISC/SHOP SUPPLIES', 'WOODL', '365222', 0, 0.0, 3.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '365222' OR UPPER(description) = 'BLACK BODY SEGMENT SEAM TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '365334', 'Tape Sealfoam 100'' Roll', 'MISC/SHOP SUPPLIES', 'AS BC', '', 1, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '365334' OR UPPER(description) = 'TAPE SEALFOAM 100'' ROLL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '371346', 'Airstream Front Window', 'MISC/SHOP SUPPLIES', '.....', '371346', 0, 490.25, 637.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '371346' OR UPPER(description) = 'AIRSTREAM FRONT WINDOW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372665', '12-2 Nm W/G 100 Ft', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 152.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372665' OR UPPER(description) = '12-2 NM W/G 100 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372764', '2Ft Abs 1.5" Pipe', 'PLUMBING', 'HDPOT', '', 0, 6.51, 8.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372764' OR UPPER(description) = '2FT ABS 1.5" PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '373226', '3In X 2Ft Abs Pipe', 'PLUMBING', 'HDPOT', '202300520', 0, 17.16, 24.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '373226' OR UPPER(description) = '3IN X 2FT ABS PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '374710', '25 Ft Romex 110V. Wire', 'MISC/SHOP SUPPLIES', 'TORK', '374710', 0, 30.0, 60.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '374710' OR UPPER(description) = '25 FT ROMEX 110V. WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '381228', 'Airstream Catch Grabber Door Latch 10 Lb', 'MISC/SHOP SUPPLIES', 'WOOD', '', 0, 0.0, 16.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '381228' OR UPPER(description) = 'AIRSTREAM CATCH GRABBER DOOR LATCH 10 LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '381408', 'Airstream Push Button Style Latch', 'MISC/SHOP SUPPLIES', 'WOOD', '381408', 3, 0.0, 39.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '381408' OR UPPER(description) = 'AIRSTREAM PUSH BUTTON STYLE LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382389', 'Gasket-Clearance Light', 'MISC/SHOP SUPPLIES', 'INTER', '', 1, 0.0, 5.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382389' OR UPPER(description) = 'GASKET-CLEARANCE LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382456', 'Airstream Swell Latch', 'MISC/SHOP SUPPLIES', 'WOOD', '382456', 4, 9.75, 19.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382456' OR UPPER(description) = 'AIRSTREAM SWELL LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382833', 'Rubber Window Seal 25 Ft', 'MISC/SHOP SUPPLIES', 'AS BC', '382833', 0, 35.0, 2.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382833' OR UPPER(description) = 'RUBBER WINDOW SEAL 25 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '385236', '6" 1Lt White Globe Lt W/ Pull Switch', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 18.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '385236' OR UPPER(description) = '6" 1LT WHITE GLOBE LT W/ PULL SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '385577', '3" Clear Tape Awning Part', 'MISC/SHOP SUPPLIES', 'INTER', '385577', 0, 24.84, 1.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '385577' OR UPPER(description) = '3" CLEAR TAPE AWNING PART');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '386150', 'Airstream Black Decal 28"', 'MISC/SHOP SUPPLIES', 'RICH', '386150', 0, 29.55, 44.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '386150' OR UPPER(description) = 'AIRSTREAM BLACK DECAL 28"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '386239', 'Serenity 3" Badge', 'MISC/SHOP SUPPLIES', 'ETRAI', '386239', 0, 30.25, 60.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '386239' OR UPPER(description) = 'SERENITY 3" BADGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '386272', 'Decal, "Airstream"  Black Chrome', 'MISC/SHOP SUPPLIES', 'ETRAI', '386272', 0, 107.95, 147.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '386272' OR UPPER(description) = 'DECAL, "AIRSTREAM"  BLACK CHROME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '389381', 'Lippert Siphon Roof Vent Cap - White', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 2, 23.11, 46.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '389381' OR UPPER(description) = 'LIPPERT SIPHON ROOF VENT CAP - WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '405221', '1/2"X1/2"X16" Braid Fct Supply Line', 'PLUMBING', 'HDPOT', '', 0, 0.0, 9.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '405221' OR UPPER(description) = '1/2"X1/2"X16" BRAID FCT SUPPLY LINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '410500', 'Outrigger Lh', 'MISC/SHOP SUPPLIES', 'ETRAI', '410500', 0, 25.4, 50.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '410500' OR UPPER(description) = 'OUTRIGGER LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '410987', 'Aluminum Wheel 15"', 'MISC/SHOP SUPPLIES', 'RICH', '410987', 0, 259.71, 337.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '410987' OR UPPER(description) = 'ALUMINUM WHEEL 15"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '411054', 'Airstream New Stye Rear Bumper Wd Body 4 Holes', 'MISC/SHOP SUPPLIES', 'RAM', '', 0, 0.0, 917.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '411054' OR UPPER(description) = 'AIRSTREAM NEW STYE REAR BUMPER WD BODY 4 HOLES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '422438', 'Solera Awning Rollbar 244" Black', 'MISC/SHOP SUPPLIES', 'TORK', '422438', 0, 279.95, 404.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '422438' OR UPPER(description) = 'SOLERA AWNING ROLLBAR 244" BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '422702', 'High Speed Hdmi Extender', 'MISC/SHOP SUPPLIES', 'TORK', '422702', 0, 17.99, 30.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '422702' OR UPPER(description) = 'HIGH SPEED HDMI EXTENDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '423628', 'Solera Light Kit', 'MISC/SHOP SUPPLIES', '.....', '423628', 0, 177.25, 256.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '423628' OR UPPER(description) = 'SOLERA LIGHT KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '423751', 'Cap - End Power Awning - Pc Black', 'MISC/SHOP SUPPLIES', 'TORK', '423751', 0, 26.23, 52.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '423751' OR UPPER(description) = 'CAP - END POWER AWNING - PC BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '431583', 'Star Washer', 'MISC/SHOP SUPPLIES', 'TORK', '431583', 0, 2.0, 6.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '431583' OR UPPER(description) = 'STAR WASHER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '432202', '100Ct Latx', 'MISC/SHOP SUPPLIES', 'HDPOT', '', 0, 0.0, 20.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '432202' OR UPPER(description) = '100CT LATX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '432252', 'Slide Topper - Passenger Side', 'MISC/SHOP SUPPLIES', 'ETRAI', '432252', 0, 186.0, 279.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '432252' OR UPPER(description) = 'SLIDE TOPPER - PASSENGER SIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '432253', 'Slide Topper Fabric  432253', 'MISC/SHOP SUPPLIES', 'TORK', '432253', 0, 0.0, 16.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '432253' OR UPPER(description) = 'SLIDE TOPPER FABRIC  432253');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '432682', 'Step Lippert Radius 24"', 'DOORS/WINDOWS/AWNINGS', 'AMAZO', '432682', 0, 114.26, 159.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '432682' OR UPPER(description) = 'STEP LIPPERT RADIUS 24"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '434981', '4 Sq Box 2 1/8 Dp 1/2 & 3/4 K.O.', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 4.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '434981' OR UPPER(description) = '4 SQ BOX 2 1/8 DP 1/2 & 3/4 K.O.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '435022', 'Inside Fit Abs Open Hub Toilet Flange With Plastic', 'MISC/SHOP SUPPLIES', 'HDEPO', '435022', 0, 6.95, 13.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '435022' OR UPPER(description) = 'INSIDE FIT ABS OPEN HUB TOILET FLANGE WITH PLASTIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '442214', 'Clear Shower Door Bottom Seal "T"', 'HARDWARE', 'HDPOT', '', 0, 0.0, 4.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '442214' OR UPPER(description) = 'CLEAR SHOWER DOOR BOTTOM SEAL "T"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '447562', '4''X8'' White Hardboard Luan Plywood', 'MISC/SHOP SUPPLIES', 'ETRAI', '447562', 0, 28.79, 57.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '447562' OR UPPER(description) = '4''X8'' WHITE HARDBOARD LUAN PLYWOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '449176', '3/4 Blk 1-Hole Plstic Clmp 6/Cd', 'ELECTRICAL', 'HDPOT', '100172418', 0, 2.2, 3.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '449176' OR UPPER(description) = '3/4 BLK 1-HOLE PLSTIC CLMP 6/CD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '452683', '36" Clear Shower Dr Bottom Seal "T"', 'HARDWARE', 'HDPOT', '', 0, 0.0, 6.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '452683' OR UPPER(description) = '36" CLEAR SHOWER DR BOTTOM SEAL "T"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '457040', 'Front Metal 3Rd Sheet', 'MISC/SHOP SUPPLIES', '.....', '457040', 0, 200.18, 280.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '457040' OR UPPER(description) = 'FRONT METAL 3RD SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '457069', 'Jayco Decal #6', 'MISC/SHOP SUPPLIES', '.....', '457069', 0, 30.13, 39.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '457069' OR UPPER(description) = 'JAYCO DECAL #6');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '457070', 'Jayco Decal #1', 'MISC/SHOP SUPPLIES', '.....', '457070', 0, 76.88, 99.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '457070' OR UPPER(description) = 'JAYCO DECAL #1');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '462620', '8Oz Pvc Cement/Primer Combo', 'PLUMBING', 'HDPOT', '', 0, 0.0, 14.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '462620' OR UPPER(description) = '8OZ PVC CEMENT/PRIMER COMBO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '470354', 'Weboost Drive Reach Rv', 'MISC/SHOP SUPPLIES', 'TORK', '470354', 0, 519.0, 674.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '470354' OR UPPER(description) = 'WEBOOST DRIVE REACH RV');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '492930', '5.0Mm 4X8 Underlayment', 'HARDWARE', 'HDPOT', '', 0, 0.0, 31.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '492930' OR UPPER(description) = '5.0MM 4X8 UNDERLAYMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '499982', 'Junction Box 4X4X2', 'ELECTRICAL', 'HDPOT', '100404097', 0, 9.9, 13.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '499982' OR UPPER(description) = 'JUNCTION BOX 4X4X2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '502030', 'Ge Sil I All Purp Clear 10.1 Oz', 'MISC/SHOP SUPPLIES', 'HDPOT', '100091111', 0, 6.98, 9.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '502030' OR UPPER(description) = 'GE SIL I ALL PURP CLEAR 10.1 OZ');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512210', 'Baraldi Range Hood', 'MISC/SHOP SUPPLIES', 'TORK', '512210', 0, 489.45, 685.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512210' OR UPPER(description) = 'BARALDI RANGE HOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512859', 'Light Clearance Amber', 'ELECTRICAL', 'INTER', '', 0, 0.0, 37.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512859' OR UPPER(description) = 'LIGHT CLEARANCE AMBER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512860', 'Light Clearance Red', 'ELECTRICAL', 'INTER', '', 0, 0.0, 37.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512860' OR UPPER(description) = 'LIGHT CLEARANCE RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512936', 'Led Spotlight Cool White Frosted', 'MISC/SHOP SUPPLIES', 'TORK', '512936', 0, 68.75, 96.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512936' OR UPPER(description) = 'LED SPOTLIGHT COOL WHITE FROSTED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512987', 'Led Spotlight Warm White  Frosted', 'MISC/SHOP SUPPLIES', 'AS IE', '512987', 5, 93.34, 93.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512987' OR UPPER(description) = 'LED SPOTLIGHT WARM WHITE  FROSTED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '513860', 'Red Clearance Light', 'MISC/SHOP SUPPLIES', 'INTER', '513860', 0, 26.59, 37.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '513860' OR UPPER(description) = 'RED CLEARANCE LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '513928', 'Airstream 12V Bath Sconce Light For Pottery Barn', 'ELECTRICAL', 'TORK', '513928', 0, 102.22, 102.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '513928' OR UPPER(description) = 'AIRSTREAM 12V BATH SCONCE LIGHT FOR POTTERY BARN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '515157', '28"X34" Pad', 'PLUMBING', 'HDPOT', '', 0, 8.7, 12.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '515157' OR UPPER(description) = '28"X34" PAD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '519891', 'Klean Strip Grn Denatured Alcohol Qt', 'MISC/SHOP SUPPLIES', 'HDPOT', '', 1, 0.0, 11.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '519891' OR UPPER(description) = 'KLEAN STRIP GRN DENATURED ALCOHOL QT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '520820', 'Furnace Ignition Control Board', 'MISC/SHOP SUPPLIES', '.....', '520820', 0, 36.99, 73.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '520820' OR UPPER(description) = 'FURNACE IGNITION CONTROL BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '531762', 'Br Eaton 20 Amp 120/240 V Single Pole Breaker', 'MISC/SHOP SUPPLIES', '.....', '531762', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '531762' OR UPPER(description) = 'BR EATON 20 AMP 120/240 V SINGLE POLE BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '533331', '68Schlagekey', 'HARDWARE', 'HDPOT', '', 0, 3.47, 4.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '533331' OR UPPER(description) = '68SCHLAGEKEY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '535811', 'Fennel Board', 'MISC/SHOP SUPPLIES', 'E&G', '535811', 0, 0.0, 129.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '535811' OR UPPER(description) = 'FENNEL BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '549046', 'Pc 18Ga 3/4" Brt Strt Brad 1M', 'HARDWARE', 'HDPOT', '', 0, 0.0, 8.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '549046' OR UPPER(description) = 'PC 18GA 3/4" BRT STRT BRAD 1M');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '549048', 'Pc 18Ga 5/8" Brt Strt Brad 1M', 'HARDWARE', 'HDPOT', '', 0, 0.0, 7.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '549048' OR UPPER(description) = 'PC 18GA 5/8" BRT STRT BRAD 1M');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '549061', 'Pc 18Ga 1-1/4" Brt Strt Brad 1M', 'HARDWARE', 'HDPOT', '', 0, 0.0, 9.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '549061' OR UPPER(description) = 'PC 18GA 1-1/4" BRT STRT BRAD 1M');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '552526', '1 1/4" X 1 1/2" Pvc Male Reducing Adapter', 'MISC/SHOP SUPPLIES', 'TORK', '552526', 0, 5.22, 15.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '552526' OR UPPER(description) = '1 1/4" X 1 1/2" PVC MALE REDUCING ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '563181', '1G Wht Nyl Midway Decora Wallplt', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 1.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '563181' OR UPPER(description) = '1G WHT NYL MIDWAY DECORA WALLPLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '566446', '1.16Th Inch Metal Cable', 'HARDWARE', 'ETRAI', '566446', 0, 0.69, 2.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '566446' OR UPPER(description) = '1.16TH INCH METAL CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '567795', 'Pvc Bushing', 'PLUMBING', 'HDPOT', '', 0, 0.0, 2.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '567795' OR UPPER(description) = 'PVC BUSHING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '570112', '16 Ft Black Awning Rail W Side Molding', 'MISC/SHOP SUPPLIES', 'ETRAI', '570112', 0, 55.16, 110.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '570112' OR UPPER(description) = '16 FT BLACK AWNING RAIL W SIDE MOLDING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '570113', 'Long Leg Black Corner Molding 7 Ft', 'MISC/SHOP SUPPLIES', 'ETRAI', '570113', 0, 65.22, 130.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '570113' OR UPPER(description) = 'LONG LEG BLACK CORNER MOLDING 7 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '570385', '90 Degree End Cap', 'PLUMBING', 'ETRAI', '570385', 0, 5.25, 15.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '570385' OR UPPER(description) = '90 DEGREE END CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '575885', 'Magnum2"Laminatedpadlockw/1-1/2"Shac', 'HARDWARE', 'HDPOT', '', 0, 0.0, 38.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '575885' OR UPPER(description) = 'MAGNUM2"LAMINATEDPADLOCKW/1-1/2"SHAC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '576468', 'Breaker Hom 50A 2-Pole', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 19.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '576468' OR UPPER(description) = 'BREAKER HOM 50A 2-POLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '578861', '19/32 4X8 Acx Plywood (Fsc)', 'HARDWARE', 'HDPOT', '', 0, 0.0, 72.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '578861' OR UPPER(description) = '19/32 4X8 ACX PLYWOOD (FSC)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '581449', 'Adj Drippers 360 Deg 10Pk Bin39', 'PLUMBING', 'HDPOT', '', 0, 0.0, 7.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '581449' OR UPPER(description) = 'ADJ DRIPPERS 360 DEG 10PK BIN39');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '581466', 'Adj Drippr On Spike 360Deg 4Pk Bn39A', 'PLUMBING', 'HDPOT', '', 0, 0.0, 6.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '581466' OR UPPER(description) = 'ADJ DRIPPR ON SPIKE 360DEG 4PK BN39A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '589538', '15A Plug', 'ELECTRICAL', 'HDPOT', '', 0, 5.67, 7.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '589538' OR UPPER(description) = '15A PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '589632', '1G Wht Decora Wallplt', 'ELECTRICAL', 'HDPOT', '100036991', 0, 0.81, 1.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '589632' OR UPPER(description) = '1G WHT DECORA WALLPLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '590670', 'Fender Washer Zinc 5/16 (Akc)', 'HARDWARE', 'HDPOT', '', 0, 0.0, 0.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '590670' OR UPPER(description) = 'FENDER WASHER ZINC 5/16 (AKC)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '590832', 'Lock Washer Zinc 5/16 (Abf)', 'HARDWARE', 'HDPOT', '', 0, 0.0, 0.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '590832' OR UPPER(description) = 'LOCK WASHER ZINC 5/16 (ABF)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '601194', 'Water Fill W Lock Door', 'MISC/SHOP SUPPLIES', 'TORK', '601194', 0, 26.49, 45.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '601194' OR UPPER(description) = 'WATER FILL W LOCK DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '601847', 'Airstream Medicine Cabinet With Mirror', 'MISC/SHOP SUPPLIES', 'TORK', '601847', 0, 269.95, 377.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '601847' OR UPPER(description) = 'AIRSTREAM MEDICINE CABINET WITH MIRROR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '608235', 'Painters Touch 2X Semi-Gloss Black', 'MISC/SHOP SUPPLIES', 'HDPOT', '', 0, 0.0, 6.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '608235' OR UPPER(description) = 'PAINTERS TOUCH 2X SEMI-GLOSS BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '610198', '1/2"X25'' Nonmtlc Lqdtite Conduit', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 24.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '610198' OR UPPER(description) = '1/2"X25'' NONMTLC LQDTITE CONDUIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '627976', '15A Wht Duplex Decora Outlet', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 3.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '627976' OR UPPER(description) = '15A WHT DUPLEX DECORA OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '634091', '3/8" Comp X 1/2" Mip Adapter Brass', 'PLUMBING', 'HDPOT', '304958602', 0, 8.47, 11.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '634091' OR UPPER(description) = '3/8" COMP X 1/2" MIP ADAPTER BRASS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '642063', 'Slam Latch', 'MISC/SHOP SUPPLIES', 'LIP', '642063', 0, 77.92, 115.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '642063' OR UPPER(description) = 'SLAM LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '647791', '3/8 X 10 Ut', 'PLUMBING', 'HDPOT', '', 0, 0.0, 31.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '647791' OR UPPER(description) = '3/8 X 10 UT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '655430', '5/16 In.-18 Zinc Pla', 'HARDWARE', 'HDPOT', '', 0, 0.0, 0.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '655430' OR UPPER(description) = '5/16 IN.-18 ZINC PLA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '655449', '3/8Hexnutuss', 'HARDWARE', 'HDPOT', '', 0, 0.0, 0.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '655449' OR UPPER(description) = '3/8HEXNUTUSS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '671134', 'Rod Threaded Zinc 24X1/2-13', 'HARDWARE', 'HDPOT', '', 0, 0.0, 7.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '671134' OR UPPER(description) = 'ROD THREADED ZINC 24X1/2-13');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '678325', 'No Hub Cplg', 'PLUMBING', 'HDPOT', '', 0, 0.0, 11.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '678325' OR UPPER(description) = 'NO HUB CPLG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '679026', 'Gbr Gold Coarse Thread 1Lb 6X1-1/4', 'HARDWARE', 'HDPOT', '', 0, 0.0, 15.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '679026' OR UPPER(description) = 'GBR GOLD COARSE THREAD 1LB 6X1-1/4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114004-02', 'Wheel Well Trim Outer', 'MISC/SHOP SUPPLIES', 'AS IE', '684936', 0, 128.06, 157.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114004-02' OR UPPER(description) = 'WHEEL WELL TRIM OUTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '684937', 'Wheel Well Trim Inner Dual Axle', 'MISC/SHOP SUPPLIES', 'AS IE', '684937', 0, 126.4, 164.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '684937' OR UPPER(description) = 'WHEEL WELL TRIM INNER DUAL AXLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685351', 'Rock Guard Gasket 36 Ft', 'MISC/SHOP SUPPLIES', 'TORK', '685351', 0, 128.3, 166.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685351' OR UPPER(description) = 'ROCK GUARD GASKET 36 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685510', 'Seam Tape Black Rubber - 100 Ft Roll', 'MISC/SHOP SUPPLIES', 'INTER', '685510', 0, 0.73, 103.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685510' OR UPPER(description) = 'SEAM TAPE BLACK RUBBER - 100 FT ROLL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '691453', 'Norcold Board/Dispplay Kit', 'MISC/SHOP SUPPLIES', 'TORK', '691453', 0, 339.99, 475.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '691453' OR UPPER(description) = 'NORCOLD BOARD/DISPPLAY KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '699603', '4Oz Cpvc/Primer Combo', 'PLUMBING', 'HDPOT', '', 0, 0.0, 13.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '699603' OR UPPER(description) = '4OZ CPVC/PRIMER COMBO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '707382', 'T-Box Rect 1/2" 1Gang Grey 34Cu', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 9.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '707382' OR UPPER(description) = 'T-BOX RECT 1/2" 1GANG GREY 34CU');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '709495', 'Latch Bauerbp-29 Euro Blk-No Cyl', 'MISC/SHOP SUPPLIES', 'LIP', '709495', 0, 63.74, 127.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '709495' OR UPPER(description) = 'LATCH BAUERBP-29 EURO BLK-NO CYL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '709496', 'Latch Bauer Bp-29 Euro Blk-W/Cyl + Keys', 'MISC/SHOP SUPPLIES', 'LIP', '709496', 0, 69.18, 138.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '709496' OR UPPER(description) = 'LATCH BAUER BP-29 EURO BLK-W/CYL + KEYS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '711751', 'Solera Regal Power Awning Speaker Drive Head Assem', 'MISC/SHOP SUPPLIES', 'TORK', '711751', 0, 379.86, 545.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '711751' OR UPPER(description) = 'SOLERA REGAL POWER AWNING SPEAKER DRIVE HEAD ASSEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '718610', 'Satin Claw Bar Assembly - Contour', 'MISC/SHOP SUPPLIES', 'ZIPD', '718610', 0, 17.0, 34.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '718610' OR UPPER(description) = 'SATIN CLAW BAR ASSEMBLY - CONTOUR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '719325', 'Square Gooseneck Faucet - Stainless Steel', 'MISC/SHOP SUPPLIES', 'TORK', '719325', 0, 61.06, 122.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '719325' OR UPPER(description) = 'SQUARE GOOSENECK FAUCET - STAINLESS STEEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '719962', '3M Safety Glass Clear 4Pk', 'HARDWARE', 'HDPOT', '', 0, 0.0, 41.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '719962' OR UPPER(description) = '3M SAFETY GLASS CLEAR 4PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '744416', '1 1/4" 90-Degree Elbow', 'PLUMBING', 'TORK', '744416', 0, 4.17, 12.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '744416' OR UPPER(description) = '1 1/4" 90-DEGREE ELBOW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '744425', 'Handy Box Cover Blank', 'ELECTRICAL', 'HDPOT', '202590842', 0, 0.98, 1.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '744425' OR UPPER(description) = 'HANDY BOX COVER BLANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '747471', '1/2 Fip Brass Tee Fitting', 'MISC/SHOP SUPPLIES', 'TORK', '747471', 0, 9.57, 28.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '747471' OR UPPER(description) = '1/2 FIP BRASS TEE FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '754670', 'Rope Reel', 'HARDWARE', 'HDPOT', '', 0, 0.0, 0.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '754670' OR UPPER(description) = 'ROPE REEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '761371', 'Jayco Decal H', 'MISC/SHOP SUPPLIES', 'BLUEC', '761371', 0, 392.3, 549.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '761371' OR UPPER(description) = 'JAYCO DECAL H');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '762607', '1/2"X3/8" Sharkbite Reducer Coupling', 'PLUMBING', 'HDPOT', '', 0, 0.0, 11.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '762607' OR UPPER(description) = '1/2"X3/8" SHARKBITE REDUCER COUPLING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '771407', 'Awning Front Cap', 'MISC/SHOP SUPPLIES', '.....', '771407', 0, 18.15, 36.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '771407' OR UPPER(description) = 'AWNING FRONT CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '771412', 'Awning Rear Cap', 'MISC/SHOP SUPPLIES', '.....', '771412', 0, 18.15, 36.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '771412' OR UPPER(description) = 'AWNING REAR CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '784915', '1 1/4  Schedule40 Slipxslip Ball Valve', 'MISC/SHOP SUPPLIES', 'TORK', '784915', 0, 7.45, 22.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '784915' OR UPPER(description) = '1 1/4  SCHEDULE40 SLIPXSLIP BALL VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '785055', '1/4" Drip Irr Tubing Poly 50''', 'PLUMBING', 'HDPOT', '', 0, 0.0, 6.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '785055' OR UPPER(description) = '1/4" DRIP IRR TUBING POLY 50''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '788795', '1" Corner Brace Galvanized', 'MISC/SHOP SUPPLIES', 'TORK', '788795', 0, 6.27, 12.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '788795' OR UPPER(description) = '1" CORNER BRACE GALVANIZED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '793616', 'Diablo 7-1/4"X24T Framing Saw Blade', 'HARDWARE', 'HDPOT', '', 0, 0.0, 13.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '793616' OR UPPER(description) = 'DIABLO 7-1/4"X24T FRAMING SAW BLADE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '793618', 'Diablo 7-1/4"X40T Finish/Plywd - 2Pk', 'HARDWARE', 'HDPOT', '', 0, 0.0, 20.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '793618' OR UPPER(description) = 'DIABLO 7-1/4"X40T FINISH/PLYWD - 2PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '798347', 'Pvc Cement', 'MISC/SHOP SUPPLIES', 'TORK', '798347', 0, 5.65, 16.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '798347' OR UPPER(description) = 'PVC CEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '800769', '3/8 In. Comp X 1/2 In. Mip Brass Adapter', 'MISC/SHOP SUPPLIES', 'HDEPO', '800769', 0, 15.37, 30.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '800769' OR UPPER(description) = '3/8 IN. COMP X 1/2 IN. MIP BRASS ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '800899', 'Everbilt Female Od Compression Fitting', 'MISC/SHOP SUPPLIES', 'HDEPO', '800899', 0, 7.55, 15.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '800899' OR UPPER(description) = 'EVERBILT FEMALE OD COMPRESSION FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '801319', 'A-162 Short Forged Nuts', 'MISC/SHOP SUPPLIES', 'TORK', '801319', 0, 5.97, 11.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '801319' OR UPPER(description) = 'A-162 SHORT FORGED NUTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '810972', 'Suburban Saw  6 Gal Water Heater', 'MISC/SHOP SUPPLIES', 'RENOG', '810972', 0, 516.45, 581.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '810972' OR UPPER(description) = 'SUBURBAN SAW  6 GAL WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '813748', 'Lippert Power Stance Tongue Jack', 'MISC/SHOP SUPPLIES', 'TORK', '813748', 0, 218.95, 328.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '813748' OR UPPER(description) = 'LIPPERT POWER STANCE TONGUE JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '818258', '1/2"X1/2" Fnpt 90 Fitting', 'MISC/SHOP SUPPLIES', 'HDEPO', '818258', 0, 5.59, 16.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '818258' OR UPPER(description) = '1/2"X1/2" FNPT 90 FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '839647', 'Nm Clamp Conn 3/8" Pk5', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 4.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '839647' OR UPPER(description) = 'NM CLAMP CONN 3/8" PK5');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '850982', 'Interstate Battey 270C', 'MISC/SHOP SUPPLIES', 'TORK', '850982', 0, 94.15, 188.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '850982' OR UPPER(description) = 'INTERSTATE BATTEY 270C');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '851271', '#1 Metal Polar White 16', 'MISC/SHOP SUPPLIES', 'BLUEC', '851271', 0, 100.88, 213.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '851271' OR UPPER(description) = '#1 METAL POLAR WHITE 16');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '876793', '4" Sq Box Cover Flat Blank', 'ELECTRICAL', 'HDPOT', '100542712', 0, 0.84, 1.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '876793' OR UPPER(description) = '4" SQ BOX COVER FLAT BLANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '883806', 'Lfa-165 Union 3/8"', 'PLUMBING', 'TORK', '700062-06', 0, 4.65, 9.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '883806' OR UPPER(description) = 'LFA-165 UNION 3/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '888735', '8 Oz. Abs Cement Black', 'MISC/SHOP SUPPLIES', 'TORK', '888735', 0, 7.87, 15.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '888735' OR UPPER(description) = '8 OZ. ABS CEMENT BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '921233', 'Propane Tank Cover 40#', 'MISC/SHOP SUPPLIES', 'ETRAI', '921233', 0, 990.0, 1287.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '921233' OR UPPER(description) = 'PROPANE TANK COVER 40#');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '928612', 'Black Sponge Window Seal', 'MISC/SHOP SUPPLIES', 'HDEPO', '928612', 0, 10.94, 21.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '928612' OR UPPER(description) = 'BLACK SPONGE WINDOW SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '933069', 'Maxxair Vent Cover Smoked', 'MISC/SHOP SUPPLIES', 'NTP', '933069', 1, 28.78, 40.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '933069' OR UPPER(description) = 'MAXXAIR VENT COVER SMOKED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '966276', 'Segment Protector Long Cs', 'MISC/SHOP SUPPLIES', '.....', '966276', 0, 480.0, 672.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '966276' OR UPPER(description) = 'SEGMENT PROTECTOR LONG CS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '966277', 'R/S Rock Guard', 'MISC/SHOP SUPPLIES', 'TORK', '966277', 0, 451.29, 676.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '966277' OR UPPER(description) = 'R/S ROCK GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '969166', 'Basecamp Shower Door Assembly 66X24', 'MISC/SHOP SUPPLIES', 'RICH', '969166', 0, 540.04, 702.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '969166' OR UPPER(description) = 'BASECAMP SHOWER DOOR ASSEMBLY 66X24');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '987414', '1 1/4" Straight Pipe', 'PLUMBING', 'TORK', '987414', 0, 5.19, 15.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '987414' OR UPPER(description) = '1 1/4" STRAIGHT PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '992620', '20 Amp Gfci  Qpf2 Ciecuit Breaker', 'MISC/SHOP SUPPLIES', 'TORK', '992620', 0, 54.98, 109.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '992620' OR UPPER(description) = '20 AMP GFCI  QPF2 CIECUIT BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1003706', 'Brake Cleaner', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 89.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1003706' OR UPPER(description) = 'BRAKE CLEANER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1068032', '36" Red Rosin Paper', 'MISC/SHOP SUPPLIES', 'TORK', '1068032', 0, 13.98, 27.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1068032' OR UPPER(description) = '36" RED ROSIN PAPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1070847', 'Brown Metal 91"', 'MISC/SHOP SUPPLIES', 'TORK', '1070847', 0, 139.97, 195.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1070847' OR UPPER(description) = 'BROWN METAL 91"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075510', 'Graphic, Dc #1 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075510', 0, 5.18, 15.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075510' OR UPPER(description) = 'GRAPHIC, DC #1 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075519', 'Graphic, Dc#11 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075519', 0, 15.14, 30.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075519' OR UPPER(description) = 'GRAPHIC, DC#11 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075521', 'Graphic, Dc #12 Rh', 'MISC/SHOP SUPPLIES', 'RENOG', '1075521', 0, 15.18, 30.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075521' OR UPPER(description) = 'GRAPHIC, DC #12 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075522', 'Graphic, Dc #13 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075522', 0, 5.47, 10.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075522' OR UPPER(description) = 'GRAPHIC, DC #13 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075523', 'Graphic, Dc #13 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075523', 0, 5.47, 10.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075523' OR UPPER(description) = 'GRAPHIC, DC #13 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075525', 'Graphic, Dc #14 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075525', 0, 7.78, 15.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075525' OR UPPER(description) = 'GRAPHIC, DC #14 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075526', 'Graphic, Dc #14 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075526', 0, 7.78, 15.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075526' OR UPPER(description) = 'GRAPHIC, DC #14 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075527', 'Graphic, Dc #15 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075527', 0, 6.97, 13.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075527' OR UPPER(description) = 'GRAPHIC, DC #15 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075528', 'Graphic, Dc #15 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075528', 0, 6.97, 13.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075528' OR UPPER(description) = 'GRAPHIC, DC #15 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075529', 'Graphic, Dc #16 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075529', 0, 7.22, 14.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075529' OR UPPER(description) = 'GRAPHIC, DC #16 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075530', 'Graphic, Dc#16 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075530', 0, 7.22, 14.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075530' OR UPPER(description) = 'GRAPHIC, DC#16 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075531', 'Graphic, Dc#17 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075531', 0, 8.51, 17.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075531' OR UPPER(description) = 'GRAPHIC, DC#17 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075532', 'Graphic, Dc#17 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075532', 0, 8.51, 17.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075532' OR UPPER(description) = 'GRAPHIC, DC#17 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075533', 'Graphic, Dc#18 Lh', 'MISC/SHOP SUPPLIES', 'TORK', '1075533', 0, 7.59, 15.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075533' OR UPPER(description) = 'GRAPHIC, DC#18 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1075534', 'Graphic, Dc #18 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1075534', 0, 7.59, 15.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1075534' OR UPPER(description) = 'GRAPHIC, DC #18 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1082225', 'Graphic, De #2 Rh', 'MISC/SHOP SUPPLIES', 'TORK', '1082225', 0, 6.1, 18.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1082225' OR UPPER(description) = 'GRAPHIC, DE #2 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1444326', 'Agm Battery 24Dcagm Interstate', 'MISC/SHOP SUPPLIES', 'DOM', '1444326', 0, 0.0, 278.92, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1444326' OR UPPER(description) = 'AGM BATTERY 24DCAGM INTERSTATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1552174', 'Exhaust Hanger', 'MISC/SHOP SUPPLIES', 'TORK', '1552174', 0, 12.9, 25.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1552174' OR UPPER(description) = 'EXHAUST HANGER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1570453', 'Cap/Strap For Hose Carrie', 'MISC/SHOP SUPPLIES', 'NTP', 'A04-0338BK', 0, 6.67, 11.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1570453' OR UPPER(description) = 'CAP/STRAP FOR HOSE CARRIE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1701281', 'Black Steel Trailer Tongue Battery Box', 'ELECTRICAL', 'TORK', '1701281', 0, 291.0, 407.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1701281' OR UPPER(description) = 'BLACK STEEL TRAILER TONGUE BATTERY BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1770910', 'Fitting Abs 1 1/2 H X 1 1', 'PLUMBING', 'NTP', '66N11ABPW', 0, 30.89, 30.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1770910' OR UPPER(description) = 'FITTING ABS 1 1/2 H X 1 1');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1784028', 'White Dome Assembly For Standard 14"X14" Vent', 'MISC/SHOP SUPPLIES', 'NTP', '6784-07-01 00:00:00', 0, 36.24, 72.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1784028' OR UPPER(description) = 'WHITE DOME ASSEMBLY FOR STANDARD 14"X14" VENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1794286', 'Mat Led Mod Swish Black/G', 'MISC/SHOP SUPPLIES', 'NTP', '53024', 7, 65.84, 109.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1794286' OR UPPER(description) = 'MAT LED MOD SWISH BLACK/G');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1798669', 'Sensor Probe', 'MISC/SHOP SUPPLIES', 'NTP', 'MP5', 9, 0.78, 1.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1798669' OR UPPER(description) = 'SENSOR PROBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1888654', 'Jayco Decal #4', 'MISC/SHOP SUPPLIES', '.....', '1888654', 0, 31.88, 41.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1888654' OR UPPER(description) = 'JAYCO DECAL #4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2102551', '14X22 Skylight White Tall', 'MISC/SHOP SUPPLIES', 'NTP', 'SL1422WT', 0, 118.49, 148.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2102551' OR UPPER(description) = '14X22 SKYLIGHT WHITE TALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2104012', 'Vision S+ 7" Monitor And', 'ELECTRICAL', 'NTP', 'FOS7HTASF', 0, 320.1, 459.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2104012' OR UPPER(description) = 'VISION S+ 7" MONITOR AND');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2154719', 'Mach 8 Plus, 15,000 Btu H', 'MISC/SHOP SUPPLIES', 'NTP', '47024-099', 0, 1679.67, 2543.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2154719' OR UPPER(description) = 'MACH 8 PLUS, 15,000 BTU H');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2339105', 'Rain Gutter Spouts, Black', 'MISC/SHOP SUPPLIES', 'NTP', '389BK-A', 7, 6.5, 14.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2339105' OR UPPER(description) = 'RAIN GUTTER SPOUTS, BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2483133', 'Starlink Winegard Sd Wall Plate', 'MISC/SHOP SUPPLIES', 'NTP', 'SD-01WP', 1, 25.07, 48.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2483133' OR UPPER(description) = 'STARLINK WINEGARD SD WALL PLATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2490468', 'White Toilet Dometic', 'MISC/SHOP SUPPLIES', 'NTP', '9610008259', 2, 0.0, 255.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2490468' OR UPPER(description) = 'WHITE TOILET DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2668707', 'Rich Solar Lithium Battery 100 Ah Alpha 1 Pro-12', 'MISC/SHOP SUPPLIES', 'NTP', 'RS-B121SP', 4, 0.0, 479.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2668707' OR UPPER(description) = 'RICH SOLAR LITHIUM BATTERY 100 AH ALPHA 1 PRO-12');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2670899', 'Rich Solar Panel Mega 100 Slim', 'MISC/SHOP SUPPLIES', 'NTP', 'RS-M100SLB', 8, 0.0, 103.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2670899' OR UPPER(description) = 'RICH SOLAR PANEL MEGA 100 SLIM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2671629', 'Rich Solar  Rs-M200', 'MISC/SHOP SUPPLIES', '.....', '9214-09-01 00:00:00', 0, 153.59, 215.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2671629' OR UPPER(description) = 'RICH SOLAR  RS-M200');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2675647', 'Z Brackets For Solar Panels', 'MISC/SHOP SUPPLIES', 'NTP', '', 10, 0.0, 14.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2675647' OR UPPER(description) = 'Z BRACKETS FOR SOLAR PANELS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2812562', 'Clear Silicone Tube', 'MISC/SHOP SUPPLIES', 'TORK', '2812562', 0, 10.88, 21.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2812562' OR UPPER(description) = 'CLEAR SILICONE TUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2920663', 'Svc,Wh 6G Wide Dl Door Ki', 'MISC/SHOP SUPPLIES', 'NTP', '94951', 0, 45.67, 83.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2920663' OR UPPER(description) = 'SVC,WH 6G WIDE DL DOOR KI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2934541', 'Air 360 Plus 5G', 'MISC/SHOP SUPPLIES', 'NTP', 'AR2-5G1', 0, 179.43, 227.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2934541' OR UPPER(description) = 'AIR 360 PLUS 5G');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3100247', 'Ac Mounting Gasket 14X14', 'MISC/SHOP SUPPLIES', 'TORK', '3100247', 0, 0.0, 57.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3100247' OR UPPER(description) = 'AC MOUNTING GASKET 14X14');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3106995.032', 'Dometic Thermostat 6-Wire', 'MISC/SHOP SUPPLIES', 'AMAZO', '3106995.032', 0, 40.68, 81.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3106995.032' OR UPPER(description) = 'DOMETIC THERMOSTAT 6-WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3107688.016', 'Dometic Ac Drain Kit', 'MISC/SHOP SUPPLIES', 'TORK', '3107688.016', 0, 84.61, 126.92, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3107688.016' OR UPPER(description) = 'DOMETIC AC DRAIN KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3265336', 'Cummins Sw-40 Oil', 'MISC/SHOP SUPPLIES', '.....', '3265336', 0, 16.78, 33.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3265336' OR UPPER(description) = 'CUMMINS SW-40 OIL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3310714.005', 'Dometic Reversing Valve Solenoid', 'MISC/SHOP SUPPLIES', 'TORK', '3310714.005', 0, 81.51, 163.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3310714.005' OR UPPER(description) = 'DOMETIC REVERSING VALVE SOLENOID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3311563', 'Start Run Capacitor Dometic', 'MISC/SHOP SUPPLIES', 'TORK', '3311563', 0, 56.99, 85.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3311563' OR UPPER(description) = 'START RUN CAPACITOR DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3312695.02', 'Refrigerator Vent Lid    Dometic', 'MISC/SHOP SUPPLIES', 'NTP', '12604', 0, 41.43, 62.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3312695.02' OR UPPER(description) = 'REFRIGERATOR VENT LID    DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3313107.107', 'Dometic Ac Servicekit Ducted', 'MISC/SHOP SUPPLIES', 'TORK', '3313107.107', 0, 121.55, 170.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3313107.107' OR UPPER(description) = 'DOMETIC AC SERVICEKIT DUCTED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3314082.011', 'Dometic 3314082011 Appliance Components Rv', 'MISC/SHOP SUPPLIES', 'AMAZO', '3314082011', 0, 0.0, 230.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3314082.011' OR UPPER(description) = 'DOMETIC 3314082011 APPLIANCE COMPONENTS RV');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3314471.001', 'Penquin Dometic Shroud', 'MISC/SHOP SUPPLIES', 'TORK', '3314471.001', 0, 203.99, 285.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3314471.001' OR UPPER(description) = 'PENQUIN DOMETIC SHROUD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3314471.003', 'Dometic Penquin Shroud', 'MISC/SHOP SUPPLIES', 'AMAZO', '3314471.003', 0, 213.07, 340.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3314471.003' OR UPPER(description) = 'DOMETIC PENQUIN SHROUD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3315332', 'Brisk Air Ii Shroud Assembly', 'MISC/SHOP SUPPLIES', 'DOM', '3315332', 0, 148.97, 208.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3315332' OR UPPER(description) = 'BRISK AIR II SHROUD ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3315332', 'Brisk Ii - Shroud Cover White', 'MISC/SHOP SUPPLIES', 'DOM', '3315332', 0, 126.06, 176.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3315332' OR UPPER(description) = 'BRISK II - SHROUD COVER WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3316230.7', 'Control Kit W Thermostat', 'MISC/SHOP SUPPLIES', 'TORK', '3316230.7', 0, 99.44, 149.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3316230.7' OR UPPER(description) = 'CONTROL KIT W THERMOSTAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3316230.7', 'Dometic Air Conditioners 3316230.700 Control Kit/R', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 167.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3316230.7' OR UPPER(description) = 'DOMETIC AIR CONDITIONERS 3316230.700 CONTROL KIT/R');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3316250-712', 'Dometic Thermostat', 'MISC/SHOP SUPPLIES', 'TORK', '3316250-712', 0, 57.49, 114.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3316250-712' OR UPPER(description) = 'DOMETIC THERMOSTAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3317032.913', 'Thermostat - Ac', 'MISC/SHOP SUPPLIES', 'TORK', '3317032.913', 0, 43.78, 87.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3317032.913' OR UPPER(description) = 'THERMOSTAT - AC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3317404', 'Ac Ceiling Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '3317404', 0, 80.06, 132.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3317404' OR UPPER(description) = 'AC CEILING ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3317404', 'Air Distribution Box - For Ac To Work', 'MISC/SHOP SUPPLIES', 'TORK', '3317404', 0, 88.3, 132.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3317404' OR UPPER(description) = 'AIR DISTRIBUTION BOX - FOR AC TO WORK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3440006', 'Airstream Double Step Assembly', 'DOORS/WINDOWS/AWNINGS', 'TORK', '3440006', 0, 710.71, 994.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3440006' OR UPPER(description) = 'AIRSTREAM DOUBLE STEP ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4017434', 'Flair 1/2 X 1/2  " Adaptor', 'PLUMBING', 'TORK', '4017434', 0, 17.99, 35.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4017434' OR UPPER(description) = 'FLAIR 1/2 X 1/2  " ADAPTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5256826', 'Sink Basket 3" Chrome', 'MISC/SHOP SUPPLIES', 'TORK', '5256826', 0, 10.72, 21.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5256826' OR UPPER(description) = 'SINK BASKET 3" CHROME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5333963', '5200 Wheel Seal', 'MISC/SHOP SUPPLIES', 'TORK', '5333963', 0, 8.63, 25.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5333963' OR UPPER(description) = '5200 WHEEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '7258801', '91.88 Inch 6 Spring Hinge Kit - Black', 'MISC/SHOP SUPPLIES', 'RICH', '7258801', 0, 301.25, 430.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '7258801' OR UPPER(description) = '91.88 INCH 6 SPRING HINGE KIT - BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9106512', 'Water Heater Wh-6Ga Sp', 'MISC/SHOP SUPPLIES', 'WOOD', '9106512', 0, 545.01, 763.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9106512' OR UPPER(description) = 'WATER HEATER WH-6GA SP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9106513', 'Water Heater Door', 'MISC/SHOP SUPPLIES', 'WOOD', '', 0, 0.0, 53.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9106513' OR UPPER(description) = 'WATER HEATER DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11048062', 'Vent Lid Smoke Wedge Shape', 'MISC/SHOP SUPPLIES', 'WOOD', 'BVD0449-A-03', 6, 0.0, 37.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11048062' OR UPPER(description) = 'VENT LID SMOKE WEDGE SHAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14810000', 'Equalizer W/Dist 1000 Lbs', 'MISC/SHOP SUPPLIES', 'WOOD', '90-00-1000', 0, 559.85, 948.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14810000' OR UPPER(description) = 'EQUALIZER W/DIST 1000 LBS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14813000', '2 5/16In Equalizer Hitch', 'MISC/SHOP SUPPLIES', 'WOOD', '91-00-6140', 0, 25.52, 39.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14813000' OR UPPER(description) = '2 5/16IN EQUALIZER HITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14813000', '2 5/16In Equal-I-Zer Hitch Ball', 'MISC/SHOP SUPPLIES', 'WOOD', 'EQUAL-I-ZER', 0, 0.0, 35.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14813000' OR UPPER(description) = '2 5/16IN EQUAL-I-ZER HITCH BALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14899144', 'E2 Round Bar 2-Point Sway Control', 'MISC/SHOP SUPPLIES', 'WOOD', '14899144', 0, 346.33, 525.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14899144' OR UPPER(description) = 'E2 ROUND BAR 2-POINT SWAY CONTROL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20300100', '12V Electric Jack', 'MISC/SHOP SUPPLIES', 'TORK', '20300100', 0, 175.85, 299.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20300100' OR UPPER(description) = '12V ELECTRIC JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24101600', 'Husky Towing Scissor Stabilizer Jack 5T', 'MISC/SHOP SUPPLIES', 'DOM', '24101600', 0, 48.56, 72.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24101600' OR UPPER(description) = 'HUSKY TOWING SCISSOR STABILIZER JACK 5T');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '25170000', 'Victron Plus Inverter 3000 Va', 'MISC/SHOP SUPPLIES', 'LIPPE', '25170000', 0, 1388.05, 1943.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '25170000' OR UPPER(description) = 'VICTRON PLUS INVERTER 3000 VA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '26111700', 'Victron Energy Multiplus-Ii 2X 120V, 3000Va 12-Vlt', 'MISC/SHOP SUPPLIES', 'AMAZO', '26111700', 0, 1456.66, 2039.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '26111700' OR UPPER(description) = 'VICTRON ENERGY MULTIPLUS-II 2X 120V, 3000VA 12-VLT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '26111704', 'Usb Charger Double Port 5A', 'MISC/SHOP SUPPLIES', 'AMAZO', '26111704', 0, 11.99, 23.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '26111704' OR UPPER(description) = 'USB CHARGER DOUBLE PORT 5A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30181700', 'Recpro Black Faucet Exterior Shower', 'MISC/SHOP SUPPLIES', 'AMAZO', '657814', 1, 0.0, 50.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30181700' OR UPPER(description) = 'RECPRO BLACK FAUCET EXTERIOR SHOWER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30181800', 'City Water Inlet Black', 'MISC/SHOP SUPPLIES', 'AMAZO', '30181800', 0, 10.99, 15.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30181800' OR UPPER(description) = 'CITY WATER INLET BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '34272629', 'Go Power 110 Watts Solar Panel', 'MISC/SHOP SUPPLIES', 'ETRL', '34272629', 0, 270.17, 499.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '34272629' OR UPPER(description) = 'GO POWER 110 WATTS SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '39120000', 'Victron Energy Bluesolar Mppt 100V 50 Amp 12/24 Vo', 'MISC/SHOP SUPPLIES', 'AMAZO', '39120000', 0, 294.95, 412.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '39120000' OR UPPER(description) = 'VICTRON ENERGY BLUESOLAR MPPT 100V 50 AMP 12/24 VO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '39121000', 'Victron Energy Multiplus 12/3000/120-50 230Ve Inve', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 2045.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '39121000' OR UPPER(description) = 'VICTRON ENERGY MULTIPLUS 12/3000/120-50 230VE INVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '39121600', '300 Amp Super Fuses W Holder', 'MISC/SHOP SUPPLIES', 'LIPPE', '39121600', 0, 31.99, 44.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '39121600' OR UPPER(description) = '300 AMP SUPER FUSES W HOLDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '40141600', 'Rec Pro Rv City Water Fill Inlet', 'MISC/SHOP SUPPLIES', 'TORK', '30181800', 0, 17.31, 25.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '40141600' OR UPPER(description) = 'REC PRO RV CITY WATER FILL INLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '52150000', 'Shurflo Pump Filter', 'MISC/SHOP SUPPLIES', 'TORK', '52150000', 0, 9.99, 14.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '52150000' OR UPPER(description) = 'SHURFLO PUMP FILTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '53100000', '1 Ft Copper Tube Flexible 3/8"', 'MISC/SHOP SUPPLIES', 'AMAZO', '53100000', 0, 2.88, 5.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '53100000' OR UPPER(description) = '1 FT COPPER TUBE FLEXIBLE 3/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '56101600', 'Two Stage Propane Regulator 1/4" / 3/8" Ntp', 'MISC/SHOP SUPPLIES', 'AMAZO', '56101600', 0, 26.99, 53.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '56101600' OR UPPER(description) = 'TWO STAGE PROPANE REGULATOR 1/4" / 3/8" NTP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '63948426', 'Southwire 63948426 100'' 10/3 With Ground Romex Bra', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 253.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '63948426' OR UPPER(description) = 'SOUTHWIRE 63948426 100'' 10/3 WITH GROUND ROMEX BRA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '70104060', 'Febco 1/4" Cock Valve For  A/S', 'MISC/SHOP SUPPLIES', 'TORK', '70104060', 0, 31.99, 63.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '70104060' OR UPPER(description) = 'FEBCO 1/4" COCK VALVE FOR  A/S');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84012201', 'Electric Jack Black 3.5K W/Cl', 'MISC/SHOP SUPPLIES', 'WOOD', '84012201', 0, 149.95, 225.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84012201' OR UPPER(description) = 'ELECTRIC JACK BLACK 3.5K W/CL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '95015600', 'Sway Control Bracket - Complete For 6K - 14K', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 95.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '95015600' OR UPPER(description) = 'SWAY CONTROL BRACKET - COMPLETE FOR 6K - 14K');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '385311641', '310 Series Toilet Valve', 'MISC/SHOP SUPPLIES', 'WOOD', '385311641', 0, 44.69, 69.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '385311641' OR UPPER(description) = '310 SERIES TOILET VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '385311652', 'Rv Toilet Seal 300,310,320 Series', 'MISC/SHOP SUPPLIES', 'TORK', '36663', 0, 13.58, 19.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '385311652' OR UPPER(description) = 'RV TOILET SEAL 300,310,320 SERIES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '385311658', 'Toilet Seal', 'MISC/SHOP SUPPLIES', '.....', '385311658', 1, 8.54, 14.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '385311658' OR UPPER(description) = 'TOILET SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '893301900', 'Resen Appoxy Black Kit', 'HARDWARE', 'RAM', '893301900', 0, 0.0, 17.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '893301900' OR UPPER(description) = 'RESEN APPOXY BLACK KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '949100000', 'Wood Flooring Panel', 'MISC/SHOP SUPPLIES', 'DOM', '949100000', 0, 0.0, 46.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '949100000' OR UPPER(description) = 'WOOD FLOORING PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '970008695', 'Dometic Roof A/C 13500 Btu Fresh Jet', 'MISC/SHOP SUPPLIES', '.....', '970008695', 0, 899.99, 1259.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '970008695' OR UPPER(description) = 'DOMETIC ROOF A/C 13500 BTU FRESH JET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000009864', '1/16 Aluminum Ferrules - 10Pk', 'HARDWARE', 'HDPOT', '', 0, 0.0, 6.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000009864' OR UPPER(description) = '1/16 ALUMINUM FERRULES - 10PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000029624', '5"X10" Sign - Smile You''Re On Camera', 'HARDWARE', 'HDPOT', '304519042', 0, 3.68, 5.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000029624' OR UPPER(description) = '5"X10" SIGN - SMILE YOU''RE ON CAMERA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000030164', 'Adj Dripr On Spike 180Deg 5Pk Bin39D', 'PLUMBING', 'HDPOT', '', 0, 0.0, 6.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000030164' OR UPPER(description) = 'ADJ DRIPR ON SPIKE 180DEG 5PK BIN39D');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000030312', '1/4" Slf Piercng Insrt Conectr Bin82', 'PLUMBING', 'HDPOT', '', 0, 0.0, 2.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000030312' OR UPPER(description) = '1/4" SLF PIERCNG INSRT CONECTR BIN82');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000030323', '1/2" (.710 Od) Drip Irr Tubing 100''', 'PLUMBING', 'HDPOT', '', 0, 0.0, 24.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000030323' OR UPPER(description) = '1/2" (.710 OD) DRIP IRR TUBING 100''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000032437', 'Liquidtite Nm Fit 1/2" Str Pkg 5', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 20.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000032437' OR UPPER(description) = 'LIQUIDTITE NM FIT 1/2" STR PKG 5');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000047929', 'Brakleen', 'HARDWARE', 'HDPOT', '', 0, 4.48, 6.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000047929' OR UPPER(description) = 'BRAKLEEN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000048428', 'Less Mess', 'HARDWARE', 'HDPOT', '', 0, 0.0, 12.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000048428' OR UPPER(description) = 'LESS MESS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000049722', '1-1/2" P-Trap Abs', 'PLUMBING', 'HDPOT', '', 0, 0.0, 6.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000049722' OR UPPER(description) = '1-1/2" P-TRAP ABS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1000994486', 'Plastic Tray Liners', 'MISC/SHOP SUPPLIES', '.....', '1000994486', 0, 6.98, 10.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1000994486' OR UPPER(description) = 'PLASTIC TRAY LINERS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001188267', '18-Gauge Crown Staples', 'MISC/SHOP SUPPLIES', '.....', '1001188267', 0, 23.98, 31.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001188267' OR UPPER(description) = '18-GAUGE CROWN STAPLES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001294861', 'Mke Cobalt 3/16" Bit 1Pc', 'HARDWARE', 'HDPOT', '', 0, 0.0, 8.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001294861' OR UPPER(description) = 'MKE COBALT 3/16" BIT 1PC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001294874', 'Mke Cobalt 5/32" Bit 1Pc', 'HARDWARE', 'HDPOT', '203115293', 0, 4.87, 6.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001294874' OR UPPER(description) = 'MKE COBALT 5/32" BIT 1PC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001294981', '1/8Box Spnt', 'HARDWARE', 'HDPOT', '', 0, 3.47, 4.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001294981' OR UPPER(description) = '1/8BOX SPNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001294987', '5/32Boxspnt', 'HARDWARE', 'HDPOT', '', 0, 2.47, 3.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001294987' OR UPPER(description) = '5/32BOXSPNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001528327', 'Ce 50Ft Cat 6 Wht Utp Patch Cable', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 26.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001528327' OR UPPER(description) = 'CE 50FT CAT 6 WHT UTP PATCH CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001533834', '1.2 Gpm Female Faucet Aerator', 'PLUMBING', 'HDPOT', '', 0, 0.0, 6.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001533834' OR UPPER(description) = '1.2 GPM FEMALE FAUCET AERATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1001869289', 'Gs Gc Qss', 'HARDWARE', 'HDPOT', '', 0, 0.0, 5.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1001869289' OR UPPER(description) = 'GS GC QSS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002064876', '3/8 Flair Nut', 'MISC/SHOP SUPPLIES', 'TORK', '1002064876', 0, 5.97, 17.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002064876' OR UPPER(description) = '3/8 FLAIR NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002064878', '1/2" Forged Flare Brass Nut Fitting', 'MISC/SHOP SUPPLIES', 'TORK', '1002064878', 0, 8.07, 24.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002064878' OR UPPER(description) = '1/2" FORGED FLARE BRASS NUT FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002081929', 'Adler 1Hdl Tub/Shower Faucet Ch', 'PLUMBING', 'HDPOT', '', 0, 0.0, 124.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002081929' OR UPPER(description) = 'ADLER 1HDL TUB/SHOWER FAUCET CH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002081930', 'Moen Adler Shower Faucet', 'MISC/SHOP SUPPLIES', 'TORK', '1002081930', 0, 96.84, 159.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002081930' OR UPPER(description) = 'MOEN ADLER SHOWER FAUCET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002245949', '1/2In. Insert Elbow-Bt', 'PLUMBING', 'HDPOT', '300814161', 0, 0.71, 0.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002245949' OR UPPER(description) = '1/2IN. INSERT ELBOW-BT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002337028', 'Ge 4 Hole Ground Bar', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 6.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002337028' OR UPPER(description) = 'GE 4 HOLE GROUND BAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002339401', 'Rainx -25 Windshield Deicer', 'HARDWARE', 'HDPOT', '', 0, 0.0, 5.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002339401' OR UPPER(description) = 'RAINX -25 WINDSHIELD DEICER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002482956', 'Diablo Bonded 5"X.045X7/8 Mtl T27', 'HARDWARE', 'HDPOT', '', 0, 0.0, 5.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002482956' OR UPPER(description) = 'DIABLO BONDED 5"X.045X7/8 MTL T27');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002509031', '1/2 In. Pinch Clamp Jar (100-Pack)', 'PLUMBING', 'HDPOT', '', 0, 0.0, 68.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002509031' OR UPPER(description) = '1/2 IN. PINCH CLAMP JAR (100-PACK)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002747511', 'Commercial Wing Nut', 'MISC/SHOP SUPPLIES', 'TORK', '1002747511', 0, 3.98, 11.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002747511' OR UPPER(description) = 'COMMERCIAL WING NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002755022', '12" Ball Bearing Slide Set', 'MISC/SHOP SUPPLIES', 'TORK', '1002755022', 0, 12.27, 24.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002755022' OR UPPER(description) = '12" BALL BEARING SLIDE SET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1002872617', 'Brecklyn Pull-Out Kitch Faucet Ch', 'PLUMBING', 'HDPOT', '', 0, 0.0, 138.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1002872617' OR UPPER(description) = 'BRECKLYN PULL-OUT KITCH FAUCET CH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1003112861', 'Assorted Rivet Kit', 'HARDWARE', 'HDPOT', '', 0, 0.0, 14.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1003112861' OR UPPER(description) = 'ASSORTED RIVET KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1003112865', '3/16" Long Rivet, Aluminum', 'HARDWARE', 'HDPOT', '', 0, 0.0, 8.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1003112865' OR UPPER(description) = '3/16" LONG RIVET, ALUMINUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1003829148', 'Reflexive Insulation Staple Tab', 'MISC/SHOP SUPPLIES', 'TORK', '1003829148', 0, 29.97, 59.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1003829148' OR UPPER(description) = 'REFLEXIVE INSULATION STAPLE TAB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1004159509', 'Dishwasher/Disposal Connector', 'PLUMBING', 'HDPOT', '', 0, 0.0, 8.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1004159509' OR UPPER(description) = 'DISHWASHER/DISPOSAL CONNECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1004558650', 'Kitchen Faucet Paulina', 'MISC/SHOP SUPPLIES', 'TORK', '1004558650', 0, 69.3, 97.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1004558650' OR UPPER(description) = 'KITCHEN FAUCET PAULINA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1004690791', 'Diablo Steel Demon 5"X .045"X7/8"', 'HARDWARE', 'HDPOT', '', 0, 0.0, 6.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1004690791' OR UPPER(description) = 'DIABLO STEEL DEMON 5"X .045"X7/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005317780', 'Kohler Towel Ring', 'MISC/SHOP SUPPLIES', '.....', '1005317780', 0, 34.98, 48.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005317780' OR UPPER(description) = 'KOHLER TOWEL RING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005496038', 'Diablo Bi-Metal Set 28Pc', 'HARDWARE', 'HDPOT', '', 0, 0.0, 41.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005496038' OR UPPER(description) = 'DIABLO BI-METAL SET 28PC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005527987', '1/2"  Str Elbow Red Brass', 'PLUMBING', 'HDPOT', '313821719', 0, 6.57, 9.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005527987' OR UPPER(description) = '1/2"  STR ELBOW RED BRASS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005531118', 'Sign', 'HARDWARE', 'HDPOT', '', 0, 0.0, 2.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005531118' OR UPPER(description) = 'SIGN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005578837', 'Pest Block Foam Sealant', 'MISC/SHOP SUPPLIES', 'HDEPO', '1005578837', 0, 10.97, 21.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005578837' OR UPPER(description) = 'PEST BLOCK FOAM SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1005660986', 'Silver Hinges', 'MISC/SHOP SUPPLIES', '.....', '1005660986', 0, 4.98, 14.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1005660986' OR UPPER(description) = 'SILVER HINGES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1006012486', 'Feit(40W) 4'' T12 A Led Tube Dl 2Pk', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 20.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1006012486' OR UPPER(description) = 'FEIT(40W) 4'' T12 A LED TUBE DL 2PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1006546210', 'Ge Sup Kbcl2', 'MISC/SHOP SUPPLIES', 'HDPOT', '', 0, 0.0, 13.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1006546210' OR UPPER(description) = 'GE SUP KBCL2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1006881905', 'Ce Multi-Assorted Cable Ties - (850-', 'ELECTRICAL', 'HDPOT', '', 0, 0.0, 18.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1006881905' OR UPPER(description) = 'CE MULTI-ASSORTED CABLE TIES - (850-');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1013893946', '3M Heavy Duct Tape', 'MISC/SHOP SUPPLIES', '.....', '1013893946', 0, 17.96, 26.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1013893946' OR UPPER(description) = '3M HEAVY DUCT TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2020125902', 'Outer Arms', 'MISC/SHOP SUPPLIES', 'TORK', '2020125902', 0, 85.88, 171.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2020125902' OR UPPER(description) = 'OUTER ARMS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2021144358', 'Rt. Rear  Compartment Door', 'MISC/SHOP SUPPLIES', 'NTP', '2021144358', 0, 331.33, 463.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2021144358' OR UPPER(description) = 'RT. REAR  COMPARTMENT DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2022107534', 'Water Heater', 'MISC/SHOP SUPPLIES', 'AMAZO', '2022107534', 0, 0.0, 711.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2022107534' OR UPPER(description) = 'WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2023052355', 'Solera Awning Arms & Hardware Kit', 'MISC/SHOP SUPPLIES', 'ETRAI', '2023052355', 0, 599.03, 799.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2023052355' OR UPPER(description) = 'SOLERA AWNING ARMS & HARDWARE KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2024028246', 'Lh Brake Plate 4400 Lb', 'MISC/SHOP SUPPLIES', '.....', '2024028246', 0, 40.73, 81.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2024028246' OR UPPER(description) = 'LH BRAKE PLATE 4400 LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2024028247', 'Rh Brake Plate 4400 Lb', 'MISC/SHOP SUPPLIES', '.....', '2024028247', 0, 40.73, 81.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2024028247' OR UPPER(description) = 'RH BRAKE PLATE 4400 LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2932575018', 'Refer Door Shelf', 'MISC/SHOP SUPPLIES', 'AMAZO', '2932575018', 0, 0.0, 41.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2932575018' OR UPPER(description) = 'REFER DOOR SHELF');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3106996022', 'Heat & Cool Relay Control Board', 'MISC/SHOP SUPPLIES', 'AMAZO', '3106996022', 0, 77.99, 155.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3106996022' OR UPPER(description) = 'HEAT & COOL RELAY CONTROL BOARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3108706189', 'Left Side Topper Spring Assembly', 'MISC/SHOP SUPPLIES', 'DOM', '3108706189', 0, 136.5, 191.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3108706189' OR UPPER(description) = 'LEFT SIDE TOPPER SPRING ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3314082011', 'Dometic Appliance Component', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 230.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3314082011' OR UPPER(description) = 'DOMETIC APPLIANCE COMPONENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3316882900', 'Refrigerator Door Handle Black', 'MISC/SHOP SUPPLIES', 'TORK', '3316882900', 0, 6.59, 19.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3316882900' OR UPPER(description) = 'REFRIGERATOR DOOR HANDLE BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3850919063', 'Fridge Door Top Strip', 'MISC/SHOP SUPPLIES', '.....', '3850919063', 0, 7.61, 22.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3850919063' OR UPPER(description) = 'FRIDGE DOOR TOP STRIP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4350430042', '12Ft 7-Pin Trailer Plug', 'MISC/SHOP SUPPLIES', 'AMAZO', '4350430042', 0, 37.13, 74.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4350430042' OR UPPER(description) = '12FT 7-PIN TRAILER PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4471008700', 'Svc Sail Switch', 'MISC/SHOP SUPPLIES', 'TORK', '4471008700', 0, 17.85, 35.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4471008700' OR UPPER(description) = 'SVC SAIL SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5864207360', 'Red Marker Light W/ Black Base Marker Light', 'MISC/SHOP SUPPLIES', '.....', '5864207360', 0, 8.96, 18.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5864207360' OR UPPER(description) = 'RED MARKER LIGHT W/ BLACK BASE MARKER LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6025012021', '60Pcs Large Flange Blind Rivets, Aluminum,Flange D', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 14.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6025012021' OR UPPER(description) = '60PCS LARGE FLANGE BLIND RIVETS, ALUMINUM,FLANGE D');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9104100252', 'Dometic Power Fan Heki Plus', 'MISC/SHOP SUPPLIES', 'DOM', '9104100252', 0, 187.07, 299.31, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9104100252' OR UPPER(description) = 'DOMETIC POWER FAN HEKI PLUS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9105306430', '641916Xx1Jo Rtu 15K', 'MISC/SHOP SUPPLIES', 'TORK', '9105306430', 0, 1403.94, 1825.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9105306430' OR UPPER(description) = '641916XX1JO RTU 15K');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9108695062', 'Dometic Air Conditioner Drain System, Penguin Ii A', 'MISC/SHOP SUPPLIES', 'DOM', '9108695062', 0, 34.65, 69.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9108695062' OR UPPER(description) = 'DOMETIC AIR CONDITIONER DRAIN SYSTEM, PENGUIN II A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9108853265', 'Dometic 9200 Power Awning Hardware - Basement', 'MISC/SHOP SUPPLIES', 'ETRAI', '9108853265', 0, 598.99, 868.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9108853265' OR UPPER(description) = 'DOMETIC 9200 POWER AWNING HARDWARE - BASEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9108853270', 'Hdwr Power Led Awning Std Black With Pitch Arm', 'MISC/SHOP SUPPLIES', 'TORK', '9108853270', 0, 760.41, 988.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9108853270' OR UPPER(description) = 'HDWR POWER LED AWNING STD BLACK WITH PITCH ARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9108860173', 'Lp Gas Alarm # 36720', 'MISC/SHOP SUPPLIES', 'TORK', '9108860173', 0, 89.11, 151.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9108860173' OR UPPER(description) = 'LP GAS ALARM # 36720');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600001062', 'Dometic Furnace Door', 'MISC/SHOP SUPPLIES', '.....', '9600001062', 0, 89.66, 134.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600001062' OR UPPER(description) = 'DOMETIC FURNACE DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600001959', '14'' X 66" Awning  Black Onyx', 'MISC/SHOP SUPPLIES', 'TORK', '9600001959', 0, 601.75, 842.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600001959' OR UPPER(description) = '14'' X 66" AWNING  BLACK ONYX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600003808', 'Dometic Penguin White Ac', 'MISC/SHOP SUPPLIES', 'TORK', '9600003808', 0, 1247.43, 1746.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600003808' OR UPPER(description) = 'DOMETIC PENGUIN WHITE AC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600011734', 'Dometic 9100  Black Awning With Led', 'MISC/SHOP SUPPLIES', 'ETRAI', '9600011734', 0, 972.74, 1459.11, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600011734' OR UPPER(description) = 'DOMETIC 9100  BLACK AWNING WITH LED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600012125', 'Dometic 8500 Manual Awning', 'MISC/SHOP SUPPLIES', 'TORK', '9600012125', 0, 651.78, 945.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600012125' OR UPPER(description) = 'DOMETIC 8500 MANUAL AWNING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600024641', 'Dometic Awning Fabric, Weathershield,Led Lights', 'MISC/SHOP SUPPLIES', 'ETRAI', '9600024641', 0, 605.93, 858.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600024641' OR UPPER(description) = 'DOMETIC AWNING FABRIC, WEATHERSHIELD,LED LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9600028598', 'Dometic Freshjet 13.5 Btu Ac', 'MISC/SHOP SUPPLIES', '.....', '9600028598', 0, 672.05, 873.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9600028598' OR UPPER(description) = 'DOMETIC FRESHJET 13.5 BTU AC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9610000926', 'Dometic Air Grille (Ducted Application)', 'MISC/SHOP SUPPLIES', 'DOM', '9610000926', 0, 62.22, 105.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9610000926' OR UPPER(description) = 'DOMETIC AIR GRILLE (DUCTED APPLICATION)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9610002462', 'Awning Fabric 17Ft Power Gray Fade', 'MISC/SHOP SUPPLIES', 'TORK', '9610002462', 0, 1279.59, 1813.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9610002462' OR UPPER(description) = 'AWNING FABRIC 17FT POWER GRAY FADE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9620015924', 'Dometic Fresh Jet 13.5K Ac White', 'MISC/SHOP SUPPLIES', '', '9620015924', 0, 981.98, 1276.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9620015924' OR UPPER(description) = 'DOMETIC FRESH JET 13.5K AC WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9620015927', 'Dometic Fresh Jet 15K Btu Ac', 'MISC/SHOP SUPPLIES', 'RICH', '9620015927', 0, 1057.51, 1449.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9620015927' OR UPPER(description) = 'DOMETIC FRESH JET 15K BTU AC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14717222235', 'Camco Rv Tank Drain Valve', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 17.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14717222235' OR UPPER(description) = 'CAMCO RV TANK DRAIN VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '26508872024', 'Moen Kitchen Faucet With Sprayer', 'MISC/SHOP SUPPLIES', '.....', '26508872024', 0, 79.0, 118.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '26508872024' OR UPPER(description) = 'MOEN KITCHEN FAUCET WITH SPRAYER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '28756956877', 'Clear 3M Silicone Tube', 'MISC/SHOP SUPPLIES', 'HDEPO', '28756956877', 0, 12.79, 19.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '28756956877' OR UPPER(description) = 'CLEAR 3M SILICONE TUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '29325760166', 'Fridge Shelf Set', 'MISC/SHOP SUPPLIES', '.....', '29325760166', 0, 65.31, 104.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '29325760166' OR UPPER(description) = 'FRIDGE SHELF SET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '29326430300', 'Dometic Bushing & Hinges Hardware', 'MISC/SHOP SUPPLIES', '.....', '29326430300', 0, 65.19, 84.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '29326430300' OR UPPER(description) = 'DOMETIC BUSHING & HINGES HARDWARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30192026250', 'Klean-Strip Gsl26 Denatured Alcohol, 1-Gallon', 'MISC/SHOP SUPPLIES', 'AMAZO', '30192026250', 0, 24.64, 49.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30192026250' OR UPPER(description) = 'KLEAN-STRIP GSL26 DENATURED ALCOHOL, 1-GALLON');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30699366248', 'Soap Dispenser', 'PLUMBING', '.....', '30699366248', 0, 32.93, 49.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30699366248' OR UPPER(description) = 'SOAP DISPENSER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '34449943406', 'Delta Bathroom Faucet Set - Bronze', 'MISC/SHOP SUPPLIES', '.....', '34449943406', 0, 139.0, 194.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '34449943406' OR UPPER(description) = 'DELTA BATHROOM FAUCET SET - BRONZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '38514090155', 'Thermal Fuse/Switch', 'MISC/SHOP SUPPLIES', 'TORK', '38514090155', 0, 41.65, 70.81, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '38514090155' OR UPPER(description) = 'THERMAL FUSE/SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '38753427782', 'Stainless Steel Repair Flange Ringe', 'MISC/SHOP SUPPLIES', 'TORK', '38753427782', 0, 6.54, 19.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '38753427782' OR UPPER(description) = 'STAINLESS STEEL REPAIR FLANGE RINGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '39003499696', 'Vinal Round Bumper', 'HARDWARE', 'TORK', '39003499696', 0, 2.02, 6.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '39003499696' OR UPPER(description) = 'VINAL ROUND BUMPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '45113999889', 'Carpet Tile', 'MISC/SHOP SUPPLIES', '.....', '45113999889', 0, 39.98, 79.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '45113999889' OR UPPER(description) = 'CARPET TILE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '75353126837', 'Multisurface Carpet Tape', 'MISC/SHOP SUPPLIES', 'RICH', '75353126837', 0, 22.9, 45.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '75353126837' OR UPPER(description) = 'MULTISURFACE CARPET TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '75967307059', 'Velcro For Curtains', 'MISC/SHOP SUPPLIES', 'RICH', '75967307059', 0, 13.39, 22.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '75967307059' OR UPPER(description) = 'VELCRO FOR CURTAINS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '77680136480', '1" X 50'' Flex Conduit', 'MISC/SHOP SUPPLIES', 'HDEPO', '', 0, 0.0, 144.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '77680136480' OR UPPER(description) = '1" X 50'' FLEX CONDUIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '123321288453', '12V Norcold Dometic Cooling Fan 120Mm', 'MISC/SHOP SUPPLIES', 'LIPPE', 'APPLIANCEANDAIR', 0, 0.0, 65.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '123321288453' OR UPPER(description) = '12V NORCOLD DOMETIC COOLING FAN 120MM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '234244685253', 'Rvs System Backup Camera', 'MISC/SHOP SUPPLIES', 'TORK', '234244685253', 0, 0.0, 278.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '234244685253' OR UPPER(description) = 'RVS SYSTEM BACKUP CAMERA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '373461939296', '96''X24'' Black Diamond Plate Front Rock Guard', 'MISC/SHOP SUPPLIES', 'NTP', '373461939296', 0, 140.89, 197.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '373461939296' OR UPPER(description) = '96''X24'' BLACK DIAMOND PLATE FRONT ROCK GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '500005707486', 'Awning Strut', 'MISC/SHOP SUPPLIES', 'TORK', '500005707486', 0, 32.25, 49.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '500005707486' OR UPPER(description) = 'AWNING STRUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '670750039638', '1/2" Pinch Clamps', 'MISC/SHOP SUPPLIES', 'TORK', '670750039638', 0, 2.49, 4.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '670750039638' OR UPPER(description) = '1/2" PINCH CLAMPS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '762765671665', '22" W Steel Battery Box', 'ELECTRICAL', '.....', '762765671665', 0, 104.99, 146.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '762765671665' OR UPPER(description) = '22" W STEEL BATTERY BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '799408270749', 'Stainless Door Catch Hardware', 'MISC/SHOP SUPPLIES', 'TORK', '799408270749', 0, 9.99, 29.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '799408270749' OR UPPER(description) = 'STAINLESS DOOR CATCH HARDWARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '816823020657', 'Hinge-F-Less Soft', 'MISC/SHOP SUPPLIES', 'TORK', '816823020657', 0, 12.93, 25.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '816823020657' OR UPPER(description) = 'HINGE-F-LESS SOFT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '880268168144', '9X12 Led Outdoor Mat', 'MISC/SHOP SUPPLIES', 'NTP', '880268168144', 0, 0.0, 109.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '880268168144' OR UPPER(description) = '9X12 LED OUTDOOR MAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '885785122419', 'Hinge-Less Soft', 'MISC/SHOP SUPPLIES', 'HDEPO', '885785122419', 0, 12.93, 25.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '885785122419' OR UPPER(description) = 'HINGE-LESS SOFT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎ 90205B', 'On Off Battery Switch 12V/24V 600A', 'MISC/SHOP SUPPLIES', 'AMAZO', '‎ 90205B', 0, 35.99, 57.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎ 90205B' OR UPPER(description) = 'ON OFF BATTERY SWITCH 12V/24V 600A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎ E12INPT-X2', '2 Pack 12 Inch Pigtail Hose Connectors Hose', 'MISC/SHOP SUPPLIES', '.....', '‎ E12INPT-X2', 0, 25.95, 51.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎ E12INPT-X2' OR UPPER(description) = '2 PACK 12 INCH PIGTAIL HOSE CONNECTORS HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '?2021VEV07251141', 'Vevor Refrigerant Recovery Machine Portable 1/2Hp', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 600.57, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '?2021VEV07251141' OR UPPER(description) = 'VEVOR REFRIGERANT RECOVERY MACHINE PORTABLE 1/2HP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '00-0070', '76_ Ascent,Cvr,Wht/Wht', 'DOORS/WINDOWS/AWNINGS', 'NTP', 'KB076002542', 0, 494.0, 765.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '00-0070' OR UPPER(description) = '76_ ASCENT,CVR,WHT/WHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '00-06401K', 'Manual Opening Maxxair Fan Deluxew Built In Rain C', 'HVAC', 'TORK', '00-06401K', 0, 198.96, 298.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '00-06401K' OR UPPER(description) = 'MANUAL OPENING MAXXAIR FAN DELUXEW BUILT IN RAIN C');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '0007500K', 'Maxx Air 00-07500K Maxxfan Deluxe With Remote - Sm', 'MISC/SHOP SUPPLIES', 'AMAZO', '00-07500K', 1, 0.0, 473.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '0007500K' OR UPPER(description) = 'MAXX AIR 00-07500K MAXXFAN DELUXE WITH REMOTE - SM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '00-07500K', 'Maxxair Deluxe Fan Control Speed', 'HVAC', '.....', '00-07500K', 0, 447.4, 626.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '00-07500K' OR UPPER(description) = 'MAXXAIR DELUXE FAN CONTROL SPEED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '007-112-00', 'Studs', 'MISC/SHOP SUPPLIES', 'TORK', '007-112-00', 0, 0.69, 1.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '007-112-00' OR UPPER(description) = 'STUDS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '008-388-80', 'Hub&Drom Nev-R-Lube 12X2', 'MISC/SHOP SUPPLIES', '.....', '008-388-80', 0, 449.5, 629.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '008-388-80' OR UPPER(description) = 'HUB&DROM NEV-R-LUBE 12X2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '008-388-80UC', 'Hub & Drum Complete 42Mm Nev-R-Lube 12X2', 'MISC/SHOP SUPPLIES', 'IRON', '008-388-80UC', 0, 478.0, 672.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '008-388-80UC' OR UPPER(description) = 'HUB & DRUM COMPLETE 42MM NEV-R-LUBE 12X2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '008-388-80UC3', 'Hub & Drum Complete Nev-R-Lube', 'MISC/SHOP SUPPLIES', 'TORK', '008-388-80UC3', 0, 478.0, 669.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '008-388-80UC3' OR UPPER(description) = 'HUB & DRUM COMPLETE NEV-R-LUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '008-42605UC3', '4400Lb Brake Hub-Drum', 'MISC/SHOP SUPPLIES', 'IRON', '008-42605UC3', 0, 151.0, 211.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '008-42605UC3' OR UPPER(description) = '4400LB BRAKE HUB-DRUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '00-955003', 'Maxxair Smoked Vent Cover', 'MISC/SHOP SUPPLIES', 'TORK', '00-955003', 0, 95.66, 138.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '00-955003' OR UPPER(description) = 'MAXXAIR SMOKED VENT COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '01-0006', 'Pick-Up Truck Cover Med.', 'MISC/SHOP SUPPLIES', 'NTP', '12284', 0, 115.85, 154.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '01-0006' OR UPPER(description) = 'PICK-UP TRUCK COVER MED.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '010-019-00', 'Wheel Seal Kit', 'MISC/SHOP SUPPLIES', '.....', '010-019-00', 8, 8.99, 5.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '010-019-00' OR UPPER(description) = 'WHEEL SEAL KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '010-3832', '1/4 20 Hex Bolts', 'MISC/SHOP SUPPLIES', 'TORK', '010-3832', 0, 0.66, 1.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '010-3832' OR UPPER(description) = '1/4 20 HEX BOLTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '01-1752', 'Dicor Diflex 10 Ft Roof Membrane', 'MISC/SHOP SUPPLIES', 'NTP', '01-1752', 0, 123.16, 172.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '01-1752' OR UPPER(description) = 'DICOR DIFLEX 10 FT ROOF MEMBRANE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '0122-0836', 'Oil Filter', 'MISC/SHOP SUPPLIES', '.....', '0122-0836', 0, 32.0, 64.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '0122-0836' OR UPPER(description) = 'OIL FILTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '017-230-07', '14" Rim', 'MISC/SHOP SUPPLIES', 'IRON', '017-230-07', 0, 39.97, 59.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '017-230-07' OR UPPER(description) = '14" RIM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '018-312-EKD', 'D Seal', 'HARDWARE', 'TORK', '018-312-EKD', 0, 2.29, 3.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '018-312-EKD' OR UPPER(description) = 'D SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '020-4246', '3/8-16 X 3.50 Gr8', 'HARDWARE', '.....', '020-4246', 0, 0.68, 2.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '020-4246' OR UPPER(description) = '3/8-16 X 3.50 GR8');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-026-00', 'Dexter Brake Assembly Electric 10X2 1/4 Lh', 'MISC/SHOP SUPPLIES', 'IRON', '', 0, 0.0, 75.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-026-00' OR UPPER(description) = 'DEXTER BRAKE ASSEMBLY ELECTRIC 10X2 1/4 LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-027-00', 'Brake Assy 10X2 1/4 Rh', 'TOWING/CHASSIS', 'TORK', '023-027-00', 0, 52.34, 75.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-027-00' OR UPPER(description) = 'BRAKE ASSY 10X2 1/4 RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-105-00', '122" Dexter Brake Assembly Electric', 'MISC/SHOP SUPPLIES', 'TORK', '023-105-00', 0, 69.24, 138.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-105-00' OR UPPER(description) = '122" DEXTER BRAKE ASSEMBLY ELECTRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-105-00LH', 'Lh Brake Assembly 12X2 6000 #', 'MISC/SHOP SUPPLIES', 'TORK', '023-105-00LH', 0, 69.24, 107.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-105-00LH' OR UPPER(description) = 'LH BRAKE ASSEMBLY 12X2 6000 #');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-105-09', 'Brake Assemblv.Electric 12X2 Lh Dexter 6000\', 'MISC/SHOP SUPPLIES', 'IRON', '023-105-09', 0, 135.0, 202.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-105-09' OR UPPER(description) = 'BRAKE ASSEMBLV.ELECTRIC 12X2 LH DEXTER 6000\');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-106-00', 'Rhbrake Assembly 12X2 6000#', 'MISC/SHOP SUPPLIES', 'TORK', '023-106-00', 0, 62.91, 97.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-106-00' OR UPPER(description) = 'RHBRAKE ASSEMBLY 12X2 6000#');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-106-09', 'Brake Assemblv.Electric 12X2 Rh Dexter 6000\', 'MISC/SHOP SUPPLIES', 'IRON', '023-106-09', 0, 135.0, 202.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-106-09' OR UPPER(description) = 'BRAKE ASSEMBLV.ELECTRIC 12X2 RH DEXTER 6000\');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-180-00', 'Dexter Electric Brake Late Assm. 12"', 'MISC/SHOP SUPPLIES', '.....', '023-180-00', 0, 95.03, 190.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-180-00' OR UPPER(description) = 'DEXTER ELECTRIC BRAKE LATE ASSM. 12"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-180-I', '12X2 Lh 6K&7K', 'TOWING/CHASSIS', 'TORK', '023-180-I', 0, 48.9, 97.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-180-I' OR UPPER(description) = '12X2 LH 6K&7K');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-181-00', 'Dexter  Electric Brake Plate Assm. 12"', 'MISC/SHOP SUPPLIES', '.....', '023-181-00', 0, 95.03, 190.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-181-00' OR UPPER(description) = 'DEXTER  ELECTRIC BRAKE PLATE ASSM. 12"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-181-I', '12X2 Rh 6K&7K', 'TOWING/CHASSIS', 'TORK', '023-181-I', 0, 48.9, 97.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-181-I' OR UPPER(description) = '12X2 RH 6K&7K');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-458', 'Brake Plates', 'MISC/SHOP SUPPLIES', '.....', '023-458', 0, 95.93, 143.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-458' OR UPPER(description) = 'BRAKE PLATES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-458-00', 'Brake Assemblv. Lh 12X2 Electric 6K Dexter Nev- R-', 'MISC/SHOP SUPPLIES', 'TORK', '023-458-00', 2, 95.93, 133.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-458-00' OR UPPER(description) = 'BRAKE ASSEMBLV. LH 12X2 ELECTRIC 6K DEXTER NEV- R-');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-459-00', 'Brake Assemblv. Rh 12X2 Electric 6K Dexter Nev- R-', 'MISC/SHOP SUPPLIES', 'IRON', '023-459-00', 2, 95.93, 138.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-459-00' OR UPPER(description) = 'BRAKE ASSEMBLV. RH 12X2 ELECTRIC 6K DEXTER NEV- R-');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-462-00', 'Dexter Brake Assembly Electric 10X2 1/4 Lh #4400', 'MISC/SHOP SUPPLIES', 'IRON', '023-462-00', 0, 114.0, 159.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-462-00' OR UPPER(description) = 'DEXTER BRAKE ASSEMBLY ELECTRIC 10X2 1/4 LH #4400');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-463-00', 'Dexter Brake Assembly Electric 10X21/4Rh #4400', 'MISC/SHOP SUPPLIES', 'IRON', '023-463-00', 0, 114.0, 159.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-463-00' OR UPPER(description) = 'DEXTER BRAKE ASSEMBLY ELECTRIC 10X21/4RH #4400');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-464--I', 'Lh 6K Brake Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '023-464--I', 0, 58.5, 104.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-464--I' OR UPPER(description) = 'LH 6K BRAKE ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-465-00', 'Brake Assembly', 'MISC/SHOP SUPPLIES', 'IRON', '023-465-00', 0, 108.0, 151.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-465-00' OR UPPER(description) = 'BRAKE ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-465-I', 'Rh 6K Brake Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '023-465-I', 0, 58.5, 104.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-465-I' OR UPPER(description) = 'RH 6K BRAKE ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-468-00', 'Brake Assembly Lh 10 X 2 1/4 Nev-R-Adjust', 'MISC/SHOP SUPPLIES', 'IRON', '023-468-00', 0, 68.0, 95.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-468-00' OR UPPER(description) = 'BRAKE ASSEMBLY LH 10 X 2 1/4 NEV-R-ADJUST');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-468-I', 'Electric Brake Assembly Lh', 'MISC/SHOP SUPPLIES', 'TORK', '023-468-I', 0, 40.73, 81.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-468-I' OR UPPER(description) = 'ELECTRIC BRAKE ASSEMBLY LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-469-00', 'Brake Assembly Rh 10 X 2 1/4 Nev-R-Adjust', 'MISC/SHOP SUPPLIES', 'IRON', '023-469-00', 0, 68.0, 95.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-469-00' OR UPPER(description) = 'BRAKE ASSEMBLY RH 10 X 2 1/4 NEV-R-ADJUST');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '023-469-I', 'Electric Brake Assembly Rh', 'MISC/SHOP SUPPLIES', 'TORK', '023-469-I', 0, 40.73, 81.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '023-469-I' OR UPPER(description) = 'ELECTRIC BRAKE ASSEMBLY RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '03-0277', 'Propane Detector Flus', 'MISC/SHOP SUPPLIES', 'NTP', '30-442-P-WT', 1, 52.14, 76.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '03-0277' OR UPPER(description) = 'PROPANE DETECTOR FLUS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '040-34', 'Nylon Nuts', 'MISC/SHOP SUPPLIES', 'TORK', '040-34', 0, 0.4, 1.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '040-34' OR UPPER(description) = 'NYLON NUTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '040-38', '1/4 Uss Nylon Hex Nut', 'MISC/SHOP SUPPLIES', 'TORK', '040-38', 0, 0.25, 0.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '040-38' OR UPPER(description) = '1/4 USS NYLON HEX NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '06-0440', 'Propane Regulator Auto Change Over', 'MISC/SHOP SUPPLIES', 'NTP', 'MEGR-253', 1, 63.8, 92.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '06-0440' OR UPPER(description) = 'PROPANE REGULATOR AUTO CHANGE OVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '06-0443', 'Propane Regulator 1/4"', 'MISC/SHOP SUPPLIES', 'NTP', 'MEGR-253P', 1, 56.52, 95.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '06-0443' OR UPPER(description) = 'PROPANE REGULATOR 1/4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '06-0454', 'Regulator Bracket', 'MISC/SHOP SUPPLIES', 'NTP', 'MEGR-RVB', 0, 4.43, 6.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '06-0454' OR UPPER(description) = 'REGULATOR BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '06-0676', '20Lb Tray Post And Hold Down', 'MISC/SHOP SUPPLIES', 'TORK', '06-0676', 0, 29.09, 49.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '06-0676' OR UPPER(description) = '20LB TRAY POST AND HOLD DOWN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '072-42HD', '3/8 Uss Hardened Flat Washer Thick', 'MISC/SHOP SUPPLIES', '.....', '072-42HD', 0, 0.39, 1.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '072-42HD' OR UPPER(description) = '3/8 USS HARDENED FLAT WASHER THICK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '07-30385', 'Lp Regulator 2 Stage', 'MISC/SHOP SUPPLIES', 'WOOD', '07-30385', 0, 26.98, 53.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '07-30385' OR UPPER(description) = 'LP REGULATOR 2 STAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '07-30405', 'Propane Regulator Bracket', 'MISC/SHOP SUPPLIES', 'AMAZO', '07-30405', 0, 7.56, 22.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '07-30405' OR UPPER(description) = 'PROPANE REGULATOR BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '08-0663', 'Gopower Solar Panel', 'MISC/SHOP SUPPLIES', 'ETRAI', '08-0663', 0, 485.31, 727.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '08-0663' OR UPPER(description) = 'GOPOWER SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '08-1020', 'Maxxair I+ Vent Cover, Tr', 'MISC/SHOP SUPPLIES', 'NTP', '00-933051', 0, 30.12, 42.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '08-1020' OR UPPER(description) = 'MAXXAIR I+ VENT COVER, TR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '08-1097', 'Streamline Squared-Arc Rv Faucet', 'PLUMBING', 'NTP', 'DF-MK533LK-MB', 0, 79.78, 99.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '08-1097' OR UPPER(description) = 'STREAMLINE SQUARED-ARC RV');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '08-1332', '20# Dot/Tc Vertical Lp Ta', 'PLUMBING', 'NTP', '10504', 0, 99.95, 125.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '08-1332' OR UPPER(description) = '20# DOT/TC VERTICAL LP TA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '09-0362', 'Digest-It Plus 16 Drop', 'MISC/SHOP SUPPLIES', 'NTP', '41G-8', 3, 12.61, 21.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '09-0362' OR UPPER(description) = 'DIGEST-IT PLUS 16 DROP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1.5PEX', 'Pinch Clamps   Single Earhose Clamp', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 31.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1.5PEX' OR UPPER(description) = 'PINCH CLAMPS   SINGLE EARHOSE CLAMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1/0 CABLE', 'Red2''-Blac2''', 'ELECTRICAL', 'E&G', '1/0 CABLE', 0, 0.0, 3.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1/0 CABLE' OR UPPER(description) = 'RED2''-BLAC2''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1/2PEX', 'Guofis 100 Pack 1/2 Inch Pex Cinch Clamp Rings,Pre', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 26.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1/2PEX' OR UPPER(description) = 'GUOFIS 100 PACK 1/2 INCH PEX CINCH CLAMP RINGS,PRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10/2 ROMEX', '10/2 Romex', 'MISC/SHOP SUPPLIES', 'TORK', '10/2 ROMEX', 0, 4.02, 5.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10/2 ROMEX' OR UPPER(description) = '10/2 ROMEX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10-036-00', '12" Hub  Wheel Seals', 'MISC/SHOP SUPPLIES', 'TORK', '10-036-00', 0, 4.45, 13.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10-036-00' OR UPPER(description) = '12" HUB  WHEEL SEALS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10-0448', 'Drain Valve C3/8" & 1/2"', 'MISC/SHOP SUPPLIES', 'NTP', '3182', 2, 3.58, 7.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10-0448' OR UPPER(description) = 'DRAIN VALVE C3/8" & 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '101131-01', 'Underbelly Wrap .024"X22.5" Pewter', 'MISC/SHOP SUPPLIES', 'AS IE', '101131-01', 0, 7.95, 11.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '101131-01' OR UPPER(description) = 'UNDERBELLY WRAP .024"X22.5" PEWTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '101131-02', 'Airstream Aluminum Sheet Black', 'MISC/SHOP SUPPLIES', '.....', '101131-02', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '101131-02' OR UPPER(description) = 'AIRSTREAM ALUMINUM SHEET BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10-1660', 'Shw 4, Ms, Bk, Qc, Pl', 'DOORS/WINDOWS/AWNINGS', 'NTP', 'PF213791', 0, 34.05, 55.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10-1660' OR UPPER(description) = 'SHW 4, MS, BK, QC, PL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1020-19', 'Fantastic Vent 1020-19 Roof Vent Cover', 'MISC/SHOP SUPPLIES', 'TORK', '1020-19', 0, 74.0, 103.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1020-19' OR UPPER(description) = 'FANTASTIC VENT 1020-19 ROOF VENT COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '102-34444', '3" Screws', 'MISC/SHOP SUPPLIES', 'TORK', '102-34444', 0, 1.4, 4.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '102-34444' OR UPPER(description) = '3" SCREWS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1028KD63', '1/2-3/8 Plastic Drain Valve', 'MISC/SHOP SUPPLIES', '.....', '1028KD63', 0, 6.85, 20.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1028KD63' OR UPPER(description) = '1/2-3/8 PLASTIC DRAIN VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10-408006', '2.25 Dexter Wheel Seal', 'MISC/SHOP SUPPLIES', 'IRON', '10-408006', 0, 4.45, 13.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10-408006' OR UPPER(description) = '2.25 DEXTER WHEEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '104343-06', 'Narrow Body Bow - Lower', 'HARDWARE', 'TORK', '104343-06', 0, 0.0, 240.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '104343-06' OR UPPER(description) = 'NARROW BODY BOW - LOWER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '104707-01', 'Airstream Extrusion', 'MISC/SHOP SUPPLIES', 'INTER', '', 1, 0.0, 5.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '104707-01' OR UPPER(description) = 'AIRSTREAM EXTRUSION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10AWG', 'Connector Cable', 'MISC/SHOP SUPPLIES', '', '10AWG', 0, 14.99, 26.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10AWG' OR UPPER(description) = 'CONNECTOR CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '10NB', '10" Brake Nut Bag 7/16 Fine Tread Flage Nut', 'MISC/SHOP SUPPLIES', 'IRON', '', 0, 0.0, 20.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '10NB' OR UPPER(description) = '10" BRAKE NUT BAG 7/16 FINE TREAD FLAGE NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11-0004', 'Check Valve/Vac Breaker,1', 'MISC/SHOP SUPPLIES', 'NTP', 'A10-3050', 0, 60.93, 96.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11-0004' OR UPPER(description) = 'CHECK VALVE/VAC BREAKER,1');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11-0004 (A10-3050)', 'Vaccum Breaker Check V Alve', 'MISC/SHOP SUPPLIES', 'NTP', '11-0004 (A10-3050)', 0, 62.27, 96.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11-0004 (A10-3050)' OR UPPER(description) = 'VACCUM BREAKER CHECK V ALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1101498-FB834', 'Itc Bathroom Faucet 5 Inch', 'MISC/SHOP SUPPLIES', 'TORK', '1101498-FB834', 0, 0.0, 164.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1101498-FB834' OR UPPER(description) = 'ITC BATHROOM FAUCET 5 INCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11-0186', 'Fill Hose Plastiflex 1-3/8" X 10'' Flex', 'MISC/SHOP SUPPLIES', 'NTP', '101', 2, 18.7, 21.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11-0186' OR UPPER(description) = 'FILL HOSE PLASTIFLEX 1-3/8" X 10'' FLEX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1102C', '10/2 Wire', 'MISC/SHOP SUPPLIES', 'TORK', '1102C', 0, 0.0, 1.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1102C' OR UPPER(description) = '10/2 WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11-0650', 'Valve Kit3" Anonda', 'MISC/SHOP SUPPLIES', 'NTP', '39240', 1, 15.73, 25.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11-0650' OR UPPER(description) = 'VALVE KIT3" ANONDA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '11-0650 B', 'Lasalle Bristol 3" Wate Valve', 'MISC/SHOP SUPPLIES', '.....', '39240', 0, 25.39, 50.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '11-0650 B' OR UPPER(description) = 'LASALLE BRISTOL 3" WATE VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114003-02', 'Airstream Inner Wheelwell Trim Dual Axle', 'MISC/SHOP SUPPLIES', 'AS IE', '', 1, 0.0, 126.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114003-02' OR UPPER(description) = 'AIRSTREAM INNER WHEELWELL TRIM DUAL AXLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114449-03', 'Lower Door Skin Exterior', 'MISC/SHOP SUPPLIES', 'TORK', '114449-03', 0, 124.62, 186.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114449-03' OR UPPER(description) = 'LOWER DOOR SKIN EXTERIOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114466-02', 'Rubrail Extrusion Lh Wheel Well', 'MISC/SHOP SUPPLIES', 'AS IE', '114466-02', 0, 9.36, 14.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114466-02' OR UPPER(description) = 'RUBRAIL EXTRUSION LH WHEEL WELL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114505-01', 'Support Brace Lower End Lh', 'HARDWARE', 'RICH', '114505-01', 0, 62.72, 81.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114505-01' OR UPPER(description) = 'SUPPORT BRACE LOWER END LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114879-03', 'Aluminum Sheet .040X33X224.75"-52 Sf Sheet', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 560.56, 706.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114879-03' OR UPPER(description) = 'ALUMINUM SHEET .040X33X224.75"-52 SF SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114879-238', 'Aluminum Lower Sheet .040"X33"X238"', 'MISC/SHOP SUPPLIES', 'AS IE', '114879-238', 0, 953.7, 1239.81, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114879-238' OR UPPER(description) = 'ALUMINUM LOWER SHEET .040"X33"X238"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114880-02', 'Upper Roadside Sheet', 'HARDWARE', 'AS IE', '114880-02', 0, 1100.9, 1431.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114880-02' OR UPPER(description) = 'UPPER ROADSIDE SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114880-03', 'Airstream 040X51X224.75"-80 Sf Sheet', 'MISC/SHOP SUPPLIES', 'INTER', '', 1, 957.6, 1307.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114880-03' OR UPPER(description) = 'AIRSTREAM 040X51X224.75"-80 SF SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114880-201', 'Aluminum Side Sheet 24 Sq Ft', 'MISC/SHOP SUPPLIES', 'WOOD', '114880-201', 0, 18.97, 24.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114880-201' OR UPPER(description) = 'ALUMINUM SIDE SHEET 24 SQ FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '114880-307', 'Aluminum Sheet  33 X51', 'MISC/SHOP SUPPLIES', 'RICH', '114880-307', 0, 379.4, 569.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '114880-307' OR UPPER(description) = 'ALUMINUM SHEET  33 X51');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '115171-02', 'Screen Door Guard', 'MISC/SHOP SUPPLIES', 'ETRAI', '115171-02', 0, 102.74, 133.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '115171-02' OR UPPER(description) = 'SCREEN DOOR GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '116167-02', 'Underbelly Skin, Aluminum 33 Sq Ft #18', 'MISC/SHOP SUPPLIES', 'ETRAI', '116167-02', 0, 79.86, 159.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '116167-02' OR UPPER(description) = 'UNDERBELLY SKIN, ALUMINUM 33 SQ FT #18');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '116376-02', 'Wheel Well Trim Inner', 'MISC/SHOP SUPPLIES', 'ETRAI', '116376-02', 0, 72.3, 144.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '116376-02' OR UPPER(description) = 'WHEEL WELL TRIM INNER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '116515-01', 'Airstream Rt Hand Door W/B', 'MISC/SHOP SUPPLIES', 'ETRAI', '116515-01', 0, 2899.0, 5095.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '116515-01' OR UPPER(description) = 'AIRSTREAM RT HAND DOOR W/B');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1172-2.5', 'Nautilus Multi Function City Water Fill', 'MISC/SHOP SUPPLIES', '.....', '1172-2.5', 0, 217.0, 303.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1172-2.5' OR UPPER(description) = 'NAUTILUS MULTI FUNCTION CITY WATER FILL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12/24 MPPT 100V 50', '100/50  Mppt  Solar Charger', 'MISC/SHOP SUPPLIES', 'TORK', '12/24 MPPT 100V 50', 0, 182.61, 255.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12/24 MPPT 100V 50' OR UPPER(description) = '100/50  MPPT  SOLAR CHARGER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12105-12-H', 'Epoch 105 Amp Lithium 12V. Battery Heated', 'MISC/SHOP SUPPLIES', 'TORK', '12105-12-H', 2, 599.0, 778.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12105-12-H' OR UPPER(description) = 'EPOCH 105 AMP LITHIUM 12V. BATTERY HEATED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12300A-H', 'Epoch 300 Ah Essential Series - Heated Lifepo4 Lit', 'MISC/SHOP SUPPLIES', '.....', '12300A-H', 0, 899.0, 1199.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12300A-H' OR UPPER(description) = 'EPOCH 300 AH ESSENTIAL SERIES - HEATED LIFEPO4 LIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '123ABC', 'Water Diaphragm Self Priming Pump 3.0 Gallons/Min', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 79.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '123ABC' OR UPPER(description) = 'WATER DIAPHRAGM SELF PRIMING PUMP 3.0 GALLONS/MIN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '124-4232', '3/8 X1" Indented Hwh Screw Bolts', 'MISC/SHOP SUPPLIES', '.....', '124-4232', 0, 2.05, 3.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '124-4232' OR UPPER(description) = '3/8 X1" INDENTED HWH SCREW BOLTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '125-05089', 'Brakleen® Brake Parts Cleaners - 20Oz Brakleen Cle', 'MISC/SHOP SUPPLIES', 'AMAZN', '125-05089', 0, 57.9, 17.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '125-05089' OR UPPER(description) = 'BRAKLEEN® BRAKE PARTS CLEANERS - 20OZ BRAKLEEN CLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12AWG', 'Solar Panel Ext Cable', 'MISC/SHOP SUPPLIES', 'TORK', '12AWG', 0, 10.86, 21.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12AWG' OR UPPER(description) = 'SOLAR PANEL EXT CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12CLN', 'Lug Nut Chrome Acorn Style 1/2-20" Nf', 'MISC/SHOP SUPPLIES', 'TORK', '12CLN', 0, 1.72, 3.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12CLN' OR UPPER(description) = 'LUG NUT CHROME ACORN STYLE 1/2-20" NF');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12CLN-L', 'Lug Nut Chrone. 1 34 Long. Bulge Style', 'MISC/SHOP SUPPLIES', 'TORK', '12CLN-L', 0, 1.24, 2.91, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12CLN-L' OR UPPER(description) = 'LUG NUT CHRONE. 1 34 LONG. BULGE STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12NB', '12" Brake Nut', 'MISC/SHOP SUPPLIES', 'TORK', '12NB', 0, 1.09, 3.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12NB' OR UPPER(description) = '12" BRAKE NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '12v 105AH', '105 Ah Epoch Lithium 105 Amp Battery', 'MISC/SHOP SUPPLIES', 'TORK', '12v 105AH', 0, 399.0, 558.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '12v 105AH' OR UPPER(description) = '105 AH EPOCH LITHIUM 105 AMP BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-0003', '10.14Oz Sikaflex 221-Whit', 'MISC/SHOP SUPPLIES', 'NTP', '017-90891', 0, 11.63, 15.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-0003' OR UPPER(description) = '10.14OZ SIKAFLEX 221-WHIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-0005', '10.14Oz Sikaflex 221-Blac', 'MISC/SHOP SUPPLIES', 'NTP', '017-90893', 0, 11.63, 15.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-0005' OR UPPER(description) = '10.14OZ SIKAFLEX 221-BLAC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-0902', 'Putty Tape   Butyle 1/8" X 1"', 'MISC/SHOP SUPPLIES', 'NTP', '5625', 18, 6.49, 11.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-0902' OR UPPER(description) = 'PUTTY TAPE   BUTYLE 1/8" X 1"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-0913', 'Large Hatch Installation', 'DOORS/WINDOWS/AWNINGS', 'NTP', '4195', 2, 4.0, 8.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-0913' OR UPPER(description) = 'LARGE HATCH INSTALLATION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-1287', '10.3Oz Lap Sealant White', 'MISC/SHOP SUPPLIES', 'NTP', '551LSW-1', 0, 7.94, 14.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-1287' OR UPPER(description) = '10.3OZ LAP SEALANT WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-1315', '10.3Oz Tube Lap Sealant W', 'MISC/SHOP SUPPLIES', 'NTP', '501LSW-1', 0, 7.4, 14.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-1315' OR UPPER(description) = '10.3OZ TUBE LAP SEALANT W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-2052', 'Black Standard Exhaust Co', 'HVAC', 'NTP', 'J116BK-CN', 0, 15.86, 25.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-2052' OR UPPER(description) = 'BLACK STANDARD EXHAUST CO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '132871-01', '3.5" X 150 Side Strip For Awning', 'MISC/SHOP SUPPLIES', '.....', '132871-01', 0, 12.78, 21.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '132871-01' OR UPPER(description) = '3.5" X 150 SIDE STRIP FOR AWNING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-30', '30 Amp Fuse', 'MISC/SHOP SUPPLIES', 'RAM', '13-30', 0, 2.99, 3.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-30' OR UPPER(description) = '30 AMP FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '13-3260', 'Door Catch, Bla Magnetic', 'MISC/SHOP SUPPLIES', 'NTP', '06-30105', 2, 8.75, 19.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '13-3260' OR UPPER(description) = 'DOOR CATCH, BLA MAGNETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '140-3280', 'Gen Air Filter', 'HVAC', 'TORK', '140-3280', 0, 7.99, 15.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '140-3280' OR UPPER(description) = 'GEN AIR FILTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14-1050', 'Ball 2-5/16X1-1/4X2-5/8 P', 'MISC/SHOP SUPPLIES', 'NTP', '30255', 1, 16.51, 26.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14-1050' OR UPPER(description) = 'BALL 2-5/16X1-1/4X2-5/8 P');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14-2926', '6K Equalizer Adj Hitch', 'MISC/SHOP SUPPLIES', 'NTP', '90-00-0600', 1, 492.09, 825.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14-2926' OR UPPER(description) = '6K EQUALIZER ADJ HITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14-2927', '10K Equalizer Adj Hitch', 'MISC/SHOP SUPPLIES', 'NTP', '90-00-1000', 2, 492.09, 825.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14-2927' OR UPPER(description) = '10K EQUALIZER ADJ HITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '14-6437', 'Breakaway Cable', 'MISC/SHOP SUPPLIES', 'NTP', '8603', 0, 14.88, 22.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '14-6437' OR UPPER(description) = 'BREAKAWAY CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1497-3601', 'Coleman Roof A/C Soft Start', 'MISC/SHOP SUPPLIES', 'AMAZO', '1497-3601', 0, 221.27, 309.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1497-3601' OR UPPER(description) = 'COLEMAN ROOF A/C SOFT START');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-0144', 'Vip 3500 Power Jack- 18"', 'MISC/SHOP SUPPLIES', 'NTP', '30828', 0, 277.69, 725.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-0144' OR UPPER(description) = 'VIP 3500 POWER JACK- 18"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-0773', 'Elec Jack, 300# Black    Lippert', 'MISC/SHOP SUPPLIES', 'NTP', '285318', 1, 217.11, 271.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-0773' OR UPPER(description) = 'ELEC JACK, 300# BLACK    LIPPERT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-1047', 'Eaz-Lift 24" Scissor Jack', 'MISC/SHOP SUPPLIES', 'NTP', '48810', 1, 66.93, 69.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-1047' OR UPPER(description) = 'EAZ-LIFT 24" SCISSOR JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-1558', 'Scissors Jacks -24In, Bx/', 'MISC/SHOP SUPPLIES', 'NTP', '76862', 1, 62.37, 122.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-1558' OR UPPER(description) = 'SCISSORS JACKS -24IN, BX/');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-1568 (30781)', 'Toungue Jack Husky', 'MISC/SHOP SUPPLIES', 'TORK', '15-1568 (30781)', 0, 0.0, 56.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-1568 (30781)' OR UPPER(description) = 'TOUNGUE JACK HUSKY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-2156', 'Rv Co/Propane Gas Alarm 2', 'MISC/SHOP SUPPLIES', 'NTP', 'RVCOLP-2W', 2, 62.77, 89.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-2156' OR UPPER(description) = 'RV CO/PROPANE GAS ALARM 2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15-4088', 'Propane Regulator 2-Stage Ap Products', 'MISC/SHOP SUPPLIES', 'NTP', 'MEGR-253P-PT15', 3, 114.87, 170.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15-4088' OR UPPER(description) = 'PROPANE REGULATOR 2-STAGE AP PRODUCTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '155-3481-02', 'Cummins Tail Pipe', 'HVAC', 'TORK', '155-3481-02', 0, 91.5, 137.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '155-3481-02' OR UPPER(description) = 'CUMMINS TAIL PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '157-440', '11/4" Clear Hose Poly', 'MISC/SHOP SUPPLIES', 'ADFAS', '157-440', 0, 3.29, 9.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '157-440' OR UPPER(description) = '11/4" CLEAR HOSE POLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '15''RV???', 'Rv Awning Fabric Replacement Waterproof Vinyl Shad', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 200.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '15''RV???' OR UPPER(description) = 'RV AWNING FABRIC REPLACEMENT WATERPROOF VINYL SHAD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '16085A36CC', 'Recpro Rv City Water Fill Inlet | Black | Optional', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 24.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '16085A36CC' OR UPPER(description) = 'RECPRO RV CITY WATER FILL INLET | BLACK | OPTIONAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '16-2514', 'Victron Energy Blue Power Direct Cable', 'MISC/SHOP SUPPLIES', 'AMAZO', '8719076019664', 1, 0.0, 20.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '16-2514' OR UPPER(description) = 'VICTRON ENERGY BLUE POWER DIRECT CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '17-3177', 'Roof Membrane Tpo 25''X8.6''', 'MISC/SHOP SUPPLIES', 'TORK', '17-3177', 0, 304.95, 426.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '17-3177' OR UPPER(description) = 'ROOF MEMBRANE TPO 25''X8.6''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1826ESK-CL', '18X26'' Skylight', 'MISC/SHOP SUPPLIES', 'AMAZO', '1826ESK-CL', 0, 49.49, 84.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1826ESK-CL' OR UPPER(description) = '18X26'' SKYLIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '183-029-14', 'Shurflo City Water Regulator', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 84.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '183-029-14' OR UPPER(description) = 'SHURFLO CITY WATER REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '18550000a', 'Flojet Macerator Pump', 'MISC/SHOP SUPPLIES', 'TORK', '18550000a', 0, 222.69, 311.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '18550000a' OR UPPER(description) = 'FLOJET MACERATOR PUMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-0538', 'Power Cord Adapter 15/30 Amp S/Blade', 'MISC/SHOP SUPPLIES', 'NTP', '1530ARV', 7, 8.35, 15.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-0538' OR UPPER(description) = 'POWER CORD ADAPTER 15/30 AMP S/BLADE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-1698', 'Inlet, 50A Black, Carded', 'ELECTRICAL', 'NTP', 'A10-50INBKVP', 1, 50.49, 82.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-1698' OR UPPER(description) = 'INLET, 50A BLACK, CARDED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19--1886', 'Face Plate', 'ELECTRICAL', 'TORK', '19--1886', 0, 5.39, 16.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19--1886' OR UPPER(description) = 'FACE PLATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-2001', 'Battery Box Blac Group 24', 'MISC/SHOP SUPPLIES', 'NTP', '55362', 1, 8.91, 11.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-2001' OR UPPER(description) = 'BATTERY BOX BLAC GROUP 24');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-2002', 'Battery Box Group 27 30 31', 'ELECTRICAL', 'NTP', '55372', 7, 9.81, 12.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-2002' OR UPPER(description) = 'BATTERY BOX GROUP 27 30 31');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-2484', '10A Spst 4.5" Push On-Pus', 'ELECTRICAL', 'NTP', 'S731', 0, 7.71, 12.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-2484' OR UPPER(description) = '10A SPST 4.5" PUSH ON-PUS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '19-2484 (S731)', 'Push On-Roof Vent Switch', 'MISC/SHOP SUPPLIES', 'NTP', '19-2484 (S731)', 0, 10.89, 16.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '19-2484 (S731)' OR UPPER(description) = 'PUSH ON-ROOF VENT SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1930-50', 'Denco Brake Clean', 'MISC/SHOP SUPPLIES', 'TORK', '1930-50', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1930-50' OR UPPER(description) = 'DENCO BRAKE CLEAN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1936-2018 ZMP', '95 Watt Legacy Solar Kit Panel ,Controller', 'MISC/SHOP SUPPLIES', 'TORK', '1936-2018 ZMP', 0, 425.46, 638.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1936-2018 ZMP' OR UPPER(description) = '95 WATT LEGACY SOLAR KIT PANEL ,CONTROLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1HEAS7', 'Alternative Pa Contour Hdwr', 'HARDWARE', 'ZIPD', '', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1HEAS7' OR UPPER(description) = 'ALTERNATIVE PA CONTOUR HDWR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1PRS169715', 'Prostar Mig', 'MISC/SHOP SUPPLIES', '.....', '1PRS169715', 0, 6.6, 8.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1PRS169715' OR UPPER(description) = 'PROSTAR MIG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1RW190', 'Alternative Pa Cfr Assembly', 'HARDWARE', 'ZIPD', '', 0, 0.0, 1463.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1RW190' OR UPPER(description) = 'ALTERNATIVE PA CFR ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1ST100', 'Heavy Duty Packaging', 'MISC/SHOP SUPPLIES', 'ZIPD', '', 0, 0.0, 70.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1ST100' OR UPPER(description) = 'HEAVY DUTY PACKAGING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '1TL1036', 'Atp Female Single', 'MISC/SHOP SUPPLIES', 'AMAZO', '1TL1036', 0, 0.0, 30.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '1TL1036' OR UPPER(description) = 'ATP FEMALE SINGLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0167', 'Fold Down Camper Latch- W', 'MISC/SHOP SUPPLIES', 'NTP', '10845', 2, 8.41, 18.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0167' OR UPPER(description) = 'FOLD DOWN CAMPER LATCH- W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0232', 'Door Latch Locking Camper', 'MISC/SHOP SUPPLIES', 'NTP', '10805', 2, 13.94, 30.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0232' OR UPPER(description) = 'DOOR LATCH LOCKING CAMPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0235', 'Water Heater Door Latch', 'MISC/SHOP SUPPLIES', 'NTP', '225', 1, 3.13, 6.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0235' OR UPPER(description) = 'WATER HEATER DOOR LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0236', 'Univ Door Security Strap', 'MISC/SHOP SUPPLIES', 'NTP', '20615', 2, 5.46, 12.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0236' OR UPPER(description) = 'UNIV DOOR SECURITY STRAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0245', 'Screen Door Latch', 'MISC/SHOP SUPPLIES', 'NTP', '10785', 2, 12.69, 28.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0245' OR UPPER(description) = 'SCREEN DOOR LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0596', 'Door Catch 2Pk Ss Baggage', 'MISC/SHOP SUPPLIES', 'NTP', '10245', 2, 4.94, 10.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0596' OR UPPER(description) = 'DOOR CATCH 2PK SS BAGGAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0651', 'Door Catch Bl 2Pk Baggage', 'MISC/SHOP SUPPLIES', 'NTP', '10224', 2, 3.5, 7.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0651' OR UPPER(description) = 'DOOR CATCH BL 2PK BAGGAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0652', 'Door Catch Wh 2Pk Baggage', 'MISC/SHOP SUPPLIES', 'NTP', '10234', 2, 3.5, 7.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0652' OR UPPER(description) = 'DOOR CATCH WH 2PK BAGGAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0666', 'T-Style Door Holder 4"', 'MISC/SHOP SUPPLIES', 'NTP', '10495', 2, 4.88, 10.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0666' OR UPPER(description) = 'T-STYLE DOOR HOLDER 4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0670', 'Door Catch- G - 2Pk Baggage', 'MISC/SHOP SUPPLIES', 'NTP', '10244', 2, 3.5, 7.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0670' OR UPPER(description) = 'DOOR CATCH- G - 2PK BAGGAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0680', 'Angled T-Style Door Holde', 'MISC/SHOP SUPPLIES', 'NTP', '10605', 2, 4.88, 10.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0680' OR UPPER(description) = 'ANGLED T-STYLE DOOR HOLDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0687', 'Door Holder T Style', 'MISC/SHOP SUPPLIES', 'NTP', '10324', 2, 4.14, 9.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0687' OR UPPER(description) = 'DOOR HOLDER T STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0688', 'Door Catch Replacement T Style', 'MISC/SHOP SUPPLIES', 'NTP', '10414', 2, 4.14, 9.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0688' OR UPPER(description) = 'DOOR CATCH REPLACEMENT T STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0690', 'Door Holder- B6" T-Style', 'MISC/SHOP SUPPLIES', 'NTP', '10434', 2, 4.36, 9.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0690' OR UPPER(description) = 'DOOR HOLDER- B6" T-STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0698', 'Door Catch 6" T Style', 'MISC/SHOP SUPPLIES', 'NTP', '10444', 2, 4.36, 9.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0698' OR UPPER(description) = 'DOOR CATCH 6" T STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0708', 'Ultimate Door Holder  4"', 'MISC/SHOP SUPPLIES', 'NTP', '10465', 2, 6.3, 13.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0708' OR UPPER(description) = 'ULTIMATE DOOR HOLDER  4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0720', 'Door Holder 6" Ss T-Style', 'MISC/SHOP SUPPLIES', 'NTP', '10525', 2, 11.0, 24.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0720' OR UPPER(description) = 'DOOR HOLDER 6" SS T-STYLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0752', 'Camper Door Latch, Black', 'MISC/SHOP SUPPLIES', 'NTP', '11675', 2, 13.94, 30.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0752' OR UPPER(description) = 'CAMPER DOOR LATCH, BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-0989', 'Refrigerator Vent Latch', 'MISC/SHOP SUPPLIES', 'NTP', '245', 2, 3.89, 8.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-0989' OR UPPER(description) = 'REFRIGERATOR VENT LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1127', 'Screen Door Latch Bi-Directional', 'MISC/SHOP SUPPLIES', 'NTP', '06-11865', 2, 9.0, 19.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1127' OR UPPER(description) = 'SCREEN DOOR LATCH BI-DIRECTIONAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1215', 'Keyed Cmpt Lock 751 5/8"', 'MISC/SHOP SUPPLIES', 'NTP', '305', 1, 4.93, 10.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1215' OR UPPER(description) = 'KEYED CMPT LOCK 751 5/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1216', 'Compartment Door Lock', 'MISC/SHOP SUPPLIES', 'NTP', '315', 2, 5.04, 11.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1216' OR UPPER(description) = 'COMPARTMENT DOOR LOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1217', 'Cmprtmnt Door Key Lock', 'MISC/SHOP SUPPLIES', 'NTP', '325', 0, 5.16, 11.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1217' OR UPPER(description) = 'CMPRTMNT DOOR KEY LOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1219', 'Screen Door Latch, Rh', 'MISC/SHOP SUPPLIES', 'NTP', '11205', 2, 8.75, 19.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1219' OR UPPER(description) = 'SCREEN DOOR LATCH, RH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1220', 'Screen Door Latch, Lh', 'MISC/SHOP SUPPLIES', 'NTP', '11215', 2, 8.75, 19.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1220' OR UPPER(description) = 'SCREEN DOOR LATCH, LH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1281', 'Gutter Spouts Pol/Wht', 'MISC/SHOP SUPPLIES', 'NTP', '389PW-A', 2, 6.5, 14.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1281' OR UPPER(description) = 'GUTTER SPOUTS POL/WHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1435', 'Door Holder 6" 90 Degree', 'MISC/SHOP SUPPLIES', 'NTP', '06-11875', 2, 11.18, 24.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1435' OR UPPER(description) = 'DOOR HOLDER 6" 90 DEGREE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1437', 'Fold Down Camper Latch &', 'MISC/SHOP SUPPLIES', 'NTP', '11845', 2, 8.41, 18.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1437' OR UPPER(description) = 'FOLD DOWN CAMPER LATCH &');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1632', 'Compartment Lock 5/8" Thumb', 'MISC/SHOP SUPPLIES', 'NTP', '115', 2, 5.24, 11.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1632' OR UPPER(description) = 'COMPARTMENT LOCK 5/8" THUMB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1635', 'Compartment Lock 7/8" Thumb', 'MISC/SHOP SUPPLIES', 'NTP', '125', 1, 5.39, 11.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1635' OR UPPER(description) = 'COMPARTMENT LOCK 7/8" THUMB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1636', 'Thumb Compartment  1 1/8"', 'MISC/SHOP SUPPLIES', 'NTP', '135', 2, 5.58, 12.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1636' OR UPPER(description) = 'THUMB COMPARTMENT  1 1/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1637', 'Compartment Lock 5/8" Keyed', 'MISC/SHOP SUPPLIES', 'NTP', '155', 2, 5.84, 12.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1637' OR UPPER(description) = 'COMPARTMENT LOCK 5/8" KEYED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1652', 'Compartment Lock 7/8" Keyed', 'MISC/SHOP SUPPLIES', 'NTP', '165', 2, 5.96, 13.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1652' OR UPPER(description) = 'COMPARTMENT LOCK 7/8" KEYED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1653', 'Keyed Compartment 1 1/8"', 'MISC/SHOP SUPPLIES', 'NTP', '175', 2, 6.09, 13.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1653' OR UPPER(description) = 'KEYED COMPARTMENT 1 1/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1713', 'Cam Lock- Code 5/8" Econo', 'MISC/SHOP SUPPLIES', 'NTP', 'L425', 2, 6.15, 10.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1713' OR UPPER(description) = 'CAM LOCK- CODE 5/8" ECONO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '201763-100', 'Rub Rail Insert 16 Ft', 'MISC/SHOP SUPPLIES', 'TORK', '201763-100', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '201763-100' OR UPPER(description) = 'RUB RAIL INSERT 16 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1874', 'Trim Molding Insert Black Vinyl', 'MISC/SHOP SUPPLIES', 'NTP', 'E469', 1, 22.05, 53.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1874' OR UPPER(description) = 'TRIM MOLDING INSERT BLACK VINYL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1889', 'Double Roller Catch', 'MISC/SHOP SUPPLIES', 'NTP', '70235', 2, 3.13, 6.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1889' OR UPPER(description) = 'DOUBLE ROLLER CATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1892', 'Door Catch Magnetic', 'MISC/SHOP SUPPLIES', 'NTP', '70275', 2, 3.13, 6.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1892' OR UPPER(description) = 'DOOR CATCH MAGNETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1893', 'Bull Dog Catch', 'MISC/SHOP SUPPLIES', 'NTP', '70305', 2, 3.63, 8.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1893' OR UPPER(description) = 'BULL DOG CATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1898', 'Push Open Cabinet Latch', 'MISC/SHOP SUPPLIES', 'NTP', '70435', 0, 8.46, 18.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1898' OR UPPER(description) = 'PUSH OPEN CABINET LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1899', 'Replmt Cabinet Strike', 'MISC/SHOP SUPPLIES', 'NTP', '70445', 2, 3.44, 7.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1899' OR UPPER(description) = 'REPLMT CABINET STRIKE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1902', 'Metal Cabinet Door St', 'MISC/SHOP SUPPLIES', 'NTP', '70545', 1, 4.99, 11.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1902' OR UPPER(description) = 'METAL CABINET DOOR ST');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1907', 'Drawer Slide Socket- ""?"', 'MISC/SHOP SUPPLIES', 'NTP', '70715', 2, 7.16, 15.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1907' OR UPPER(description) = 'DRAWER SLIDE SOCKET- ""?"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1908', 'Drawer Slide Socket-Small', 'MISC/SHOP SUPPLIES', 'NTP', '70725', 2, 4.69, 10.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1908' OR UPPER(description) = 'DRAWER SLIDE SOCKET-SMALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1909', 'Drawer Slide Socket-Large', 'MISC/SHOP SUPPLIES', 'NTP', '70735', 2, 4.94, 10.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1909' OR UPPER(description) = 'DRAWER SLIDE SOCKET-LARGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '201912-100', 'Molding Chrome Beltline 100Ft Roll', 'MISC/SHOP SUPPLIES', 'AS IE', '', 0, 0.0, 217.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '201912-100' OR UPPER(description) = 'MOLDING CHROME BELTLINE 100FT ROLL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1927', 'Curtain Glide Tape- 72"', 'MISC/SHOP SUPPLIES', 'NTP', '81365', 2, 7.0, 15.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1927' OR UPPER(description) = 'CURTAIN GLIDE TAPE- 72"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1939', 'Window Shade Mounting Hardware', 'MISC/SHOP SUPPLIES', 'NTP', '81635', 2, 2.5, 5.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1939' OR UPPER(description) = 'WINDOW SHADE MOUNTING HARDWARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1953', 'Sliding Mirrored Door Cat', 'MISC/SHOP SUPPLIES', 'NTP', '20665', 2, 4.95, 8.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1953' OR UPPER(description) = 'SLIDING MIRRORED DOOR CAT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1960', 'Double Roller Catch W', 'MISC/SHOP SUPPLIES', 'NTP', '70225', 2, 2.78, 6.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1960' OR UPPER(description) = 'DOUBLE ROLLER CATCH W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1962', 'Cabinet Door', 'MISC/SHOP SUPPLIES', 'NTP', '70555', 2, 4.99, 11.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1962' OR UPPER(description) = 'CABINET DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1967', 'Pleated Shade Hold Do', 'MISC/SHOP SUPPLIES', 'NTP', '81705', 2, 2.76, 6.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1967' OR UPPER(description) = 'PLEATED SHADE HOLD DO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-1977', 'Shade Hold 2Pk Day/Night', 'MISC/SHOP SUPPLIES', 'NTP', '81735', 2, 1.98, 4.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-1977' OR UPPER(description) = 'SHADE HOLD 2PK DAY/NIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20-2045', 'Door Catch Sqr Baggage', 'MISC/SHOP SUPPLIES', 'NTP', '10355', 2, 3.31, 7.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20-2045' OR UPPER(description) = 'DOOR CATCH SQR BAGGAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '203850-01', 'Rear Cs Skirting', 'MISC/SHOP SUPPLIES', 'AS IE', '203850-01', 0, 110.79, 144.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '203850-01' OR UPPER(description) = 'REAR CS SKIRTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '203850-07', 'Rear Center Underbelly', 'MISC/SHOP SUPPLIES', 'AS IE', '203850-07', 0, 111.59, 156.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '203850-07' OR UPPER(description) = 'REAR CENTER UNDERBELLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '204254-03', 'Banana Wrap Rear Cs', 'MISC/SHOP SUPPLIES', 'ETRAI', '204254-03', 0, 43.64, 87.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '204254-03' OR UPPER(description) = 'BANANA WRAP REAR CS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2060-48MP', 'Scotch Rough Surface Painter''S Tape, 1.88 Inches X', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 10.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2060-48MP' OR UPPER(description) = 'SCOTCH ROUGH SURFACE PAINTER''S TAPE, 1.88 INCHES X');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '20X33666A', 'Window 24" X 44" Frameless Exit', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 386.89, 541.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '20X33666A' OR UPPER(description) = 'WINDOW 24" X 44" FRAMELESS EXIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '21012R', 'Head Casting, Read Red Logo', 'MISC/SHOP SUPPLIES', 'ZIPD', '21012R', 0, 44.0, 88.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '21012R' OR UPPER(description) = 'HEAD CASTING, READ RED LOGO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '210-FS', '100W Flexible Solar Panel', 'MISC/SHOP SUPPLIES', 'TORK', '210-FS', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '210-FS' OR UPPER(description) = '100W FLEXIBLE SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2110XX', 'Shadepro - Rv Awning Fabric Replacement - Heavy Du', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 315.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2110XX' OR UPPER(description) = 'SHADEPRO - RV AWNING FABRIC REPLACEMENT - HEAVY DU');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '212-6607-6-8', '3/16 Olympic Rivet', 'MISC/SHOP SUPPLIES', 'TORK', '212-6607-6-8', 0, 1.99, 5.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '212-6607-6-8' OR UPPER(description) = '3/16 OLYMPIC RIVET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '212-6607-8-8', '1/4  Olympic Rivets', 'MISC/SHOP SUPPLIES', '.....', '212-6607-8-8', 0, 1.99, 5.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '212-6607-8-8' OR UPPER(description) = '1/4  OLYMPIC RIVETS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '212-68AAD', '3/16 X 1/2 Rivets', 'MISC/SHOP SUPPLIES', 'TORK', '212-68AAD', 0, 0.13, 0.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '212-68AAD' OR UPPER(description) = '3/16 X 1/2 RIVETS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0229', 'Round Vent 6" 12V Powered', 'HVAC', 'NTP', 'VP-543', 2, 95.21, 133.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0229' OR UPPER(description) = 'ROUND VENT 6" 12V POWERED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0283', 'Smoke Dome Kit', 'MISC/SHOP SUPPLIES', 'NTP', 'K1020-19', 0, 37.27, 46.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0283' OR UPPER(description) = 'SMOKE DOME KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0383', 'Vent Cover Black', 'MISC/SHOP SUPPLIES', 'NTP', '00-933069', 1, 28.78, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0383' OR UPPER(description) = 'VENT COVER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0389', 'Maxxfan Remote Smk Lid', 'MISC/SHOP SUPPLIES', 'NTP', '00-07500K', 1, 437.88, 569.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0389' OR UPPER(description) = 'MAXXFAN REMOTE SMK LID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0443', 'Vent Lid, White  Unimaxx', 'MISC/SHOP SUPPLIES', 'NTP', '00-335001', 2, 27.08, 39.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0443' OR UPPER(description) = 'VENT LID, WHITE  UNIMAXX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0473', 'Heating/Cooling Register Floor Mount 2X10', 'MISC/SHOP SUPPLIES', 'NTP', '02-28915', 2, 6.38, 14.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0473' OR UPPER(description) = 'HEATING/COOLING REGISTER FLOOR MOUNT 2X10');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0475', 'Heating/Cooling Register Floor Mount', 'MISC/SHOP SUPPLIES', 'NTP', '02-28935', 2, 5.75, 12.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0475' OR UPPER(description) = 'HEATING/COOLING REGISTER FLOOR MOUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-0498', 'Sewer Vent 2.5"', 'MISC/SHOP SUPPLIES', 'NTP', '40032', 2, 2.31, 2.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-0498' OR UPPER(description) = 'SEWER VENT 2.5"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22333tb', '12" Wheel Seals For Drum', 'MISC/SHOP SUPPLIES', 'IRON', '22333tb', 0, 5.99, 9.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22333tb' OR UPPER(description) = '12" WHEEL SEALS FOR DRUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22333TB', 'Axel Seal', 'MISC/SHOP SUPPLIES', 'AMAZO', '22333TB', 0, 6.5, 9.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22333TB' OR UPPER(description) = 'AXEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22-8889', 'Maxxfan 4401K Smoke', 'MISC/SHOP SUPPLIES', 'NTP', '00A04401K', 3, 166.49, 232.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22-8889' OR UPPER(description) = 'MAXXFAN 4401K SMOKE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '22XXxx', 'Shadepro - Rv Awning Fabric Replacement - Premium', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 236.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '22XXxx' OR UPPER(description) = 'SHADEPRO - RV AWNING FABRIC REPLACEMENT - PREMIUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23-0569', 'Window Crank-1 3/8" Plastic', 'MISC/SHOP SUPPLIES', 'NTP', '20215', 2, 3.4, 7.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23-0569' OR UPPER(description) = 'WINDOW CRANK-1 3/8" PLASTIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23-0571', 'Window Crank 1" Metal', 'MISC/SHOP SUPPLIES', 'NTP', '20265', 2, 4.35, 9.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23-0571' OR UPPER(description) = 'WINDOW CRANK 1" METAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23-0574', 'Window Knob W/1" Shaft- W', 'MISC/SHOP SUPPLIES', 'NTP', '20335', 2, 2.74, 6.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23-0574' OR UPPER(description) = 'WINDOW KNOB W/1" SHAFT- W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23-0575', 'Window Knob W/1" Shaft- B', 'MISC/SHOP SUPPLIES', 'NTP', '20345', 2, 2.74, 6.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23-0575' OR UPPER(description) = 'WINDOW KNOB W/1" SHAFT- B');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '23-0576', 'Window Knob W/ 1/2" Shaft', 'MISC/SHOP SUPPLIES', 'NTP', '20355', 2, 2.68, 5.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '23-0576' OR UPPER(description) = 'WINDOW KNOB W/ 1/2" SHAFT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24130-RVW-205', 'Winegard Replacement Antenna Head', 'MISC/SHOP SUPPLIES', '.....', '24130-RVW-205', 0, 79.0, 110.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24130-RVW-205' OR UPPER(description) = 'WINEGARD REPLACEMENT ANTENNA HEAD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24215B', 'Hot Max High Pressure Propane Regulator 15 Psi', 'MISC/SHOP SUPPLIES', 'AMAZO', '24215B', 0, 22.59, 45.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24215B' OR UPPER(description) = 'HOT MAX HIGH PRESSURE PROPANE REGULATOR 15 PSI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24-3031', 'Radius Corner 14X14 Ceili', 'MISC/SHOP SUPPLIES', 'NTP', 'VA0445-30', 0, 14.28, 19.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24-3031' OR UPPER(description) = 'RADIUS CORNER 14X14 CEILI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24606Z2', '1/2 Inch Poly Crimp Ball Valve', 'MISC/SHOP SUPPLIES', 'TORK', '24606Z2', 0, 12.48, 24.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24606Z2' OR UPPER(description) = '1/2 INCH POLY CRIMP BALL VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '24MAGM', 'Group 24 Agm Interstate', 'MISC/SHOP SUPPLIES', 'TORK', '24MAGM', 0, 139.95, 279.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '24MAGM' OR UPPER(description) = 'GROUP 24 AGM INTERSTATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '255-313', 'Water Filter Shurflo', 'MISC/SHOP SUPPLIES', '.....', '255-313', 14, 9.99, 19.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '255-313' OR UPPER(description) = 'WATER FILTER SHURFLO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '26PL40A', '40 Amp Breaker', 'MISC/SHOP SUPPLIES', 'TORK', '26PL40A', 0, 17.89, 26.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '26PL40A' OR UPPER(description) = '40 AMP BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '27001F', 'Front Main Arm Assembly Awning Zip Dee', 'MISC/SHOP SUPPLIES', 'ZIPD', '27001F', 0, 1053.0, 1576.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '27001F' OR UPPER(description) = 'FRONT MAIN ARM ASSEMBLY AWNING ZIP DEE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '27-9835', 'Rv Water Pump 12V 3Gpm 50', 'MISC/SHOP SUPPLIES', 'NTP', 'R3526144D', 0, 106.25, 158.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '27-9835' OR UPPER(description) = 'RV WATER PUMP 12V 3GPM 50');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '28430W-01', 'Can Acyular Seam Sealant 16 Oz', 'MISC/SHOP SUPPLIES', 'WOOD', '28430W-01', 1, 46.57, 65.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '28430W-01' OR UPPER(description) = 'CAN ACYULAR SEAM SEALANT 16 OZ');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '28430w-01', 'Gray Acryl-R Sealant 16Oz', 'MISC/SHOP SUPPLIES', 'AS BC', '', 2, 0.0, 51.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '28430w-01' OR UPPER(description) = 'GRAY ACRYL-R SEALANT 16OZ');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '28430w-2', 'Ac-U-Lar Exterior Sealant', 'MISC/SHOP SUPPLIES', 'WOODL', '28430w-2', 0, 0.0, 47.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '28430w-2' OR UPPER(description) = 'AC-U-LAR EXTERIOR SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2843W-011001', 'White Adseal', 'MISC/SHOP SUPPLIES', 'TORK', '4552', 0, 23.78, 33.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2843W-011001' OR UPPER(description) = 'WHITE ADSEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2890241-24', 'Control Module For Dometic Fridge', 'MISC/SHOP SUPPLIES', 'TORK', '2890241-24', 0, 213.75, 299.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2890241-24' OR UPPER(description) = 'CONTROL MODULE FOR DOMETIC FRIDGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2890638-02', 'Operating Panel W Temp Probe For Dometic Fridge', 'MISC/SHOP SUPPLIES', 'TORK', '2890638-02', 0, 222.3, 311.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2890638-02' OR UPPER(description) = 'OPERATING PANEL W TEMP PROBE FOR DOMETIC FRIDGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2B-CAP', 'Zamp Double Port Roof Kit', 'MISC/SHOP SUPPLIES', 'E&G', '2B-CAP', 0, 0.0, 39.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2B-CAP' OR UPPER(description) = 'ZAMP DOUBLE PORT ROOF KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2GWH-19', 'Girard Water Heater Part', 'HVAC', 'RICH', '2GWH-19', 0, 44.01, 66.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2GWH-19' OR UPPER(description) = 'GIRARD  PROD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2GWH-24', 'Girard Flow Switch', 'MISC/SHOP SUPPLIES', 'RICH', '2GWH-24', 0, 21.59, 43.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2GWH-24' OR UPPER(description) = 'GIRARD FLOW SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2GWH-8', 'Girard Control Board Micro Processor', 'MISC/SHOP SUPPLIES', 'RICH', '2GWH-8', 0, 190.0, 274.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2GWH-8' OR UPPER(description) = 'GIRARD CONTROL BOARD MICRO PROCESSOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2GWHAM', 'Girard Tankless Water Heater', 'MISC/SHOP SUPPLIES', '.....', '2GWHAM', 0, 589.4, 766.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2GWHAM' OR UPPER(description) = 'GIRARD TANKLESS WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2GWHDA6', 'Girard Water Heater Door Kit - White', 'MISC/SHOP SUPPLIES', 'ADFAS', '2GWHDA6', 0, 52.92, 79.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2GWHDA6' OR UPPER(description) = 'GIRARD WATER HEATER DOOR KIT - WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2WBKL', 'Morryde Tandem Wet Kit', 'MISC/SHOP SUPPLIES', 'TORK', '2WBKL', 0, 105.0, 168.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2WBKL' OR UPPER(description) = 'MORRYDE TANDEM WET KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '2WBKS', 'Tandem Mor Ride Wet Bolt Kit', 'MISC/SHOP SUPPLIES', 'TORK', '2WBKS', 0, 105.99, 180.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '2WBKS' OR UPPER(description) = 'TANDEM MOR RIDE WET BOLT KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '300A', 'Bus Bar 12V Power Distribution Block', 'MISC/SHOP SUPPLIES', 'TORK', '300A', 0, 39.99, 79.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '300A' OR UPPER(description) = 'BUS BAR 12V POWER DISTRIBUTION BLOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30196006EGLED', 'Carefree Ss Shale Black 1 Piece Canopy', 'MISC/SHOP SUPPLIES', 'TORK', '30196006EGLED', 0, 242.0, 338.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30196006EGLED' OR UPPER(description) = 'CAREFREE SS SHALE BLACK 1 PIECE CANOPY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '303-842 MP', 'Kitchen Ptrap 1-1/2" Black', 'MISC/SHOP SUPPLIES', 'HDEPO', '303-842 MP', 0, 15.99, 23.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '303-842 MP' OR UPPER(description) = 'KITCHEN PTRAP 1-1/2" BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '30-442-P-WT', '30 Series Lp Detector', 'ELECTRICAL', '.....', '30-442-P-WT', 0, 48.11, 96.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '30-442-P-WT' OR UPPER(description) = '30 SERIES LP DETECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3106863.065C', 'Door Panel Fridge', 'MISC/SHOP SUPPLIES', '.....', '3106863.065C', 0, 72.6, 145.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3106863.065C' OR UPPER(description) = 'DOOR PANEL FRIDGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31705 TOILET VALVE', 'Toilet Valve Main For Flush', 'MISC/SHOP SUPPLIES', 'TORK', '31705 TOILET VALVE', 0, 44.09, 61.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31705 TOILET VALVE' OR UPPER(description) = 'TOILET VALVE MAIN FOR FLUSH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '31M-AGM', 'Interstate Agm Battery', 'MISC/SHOP SUPPLIES', 'TORK', '31M-AGM', 0, 0.0, 454.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '31M-AGM' OR UPPER(description) = 'INTERSTATE AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3220AWT', 'Two Handle Shower Diverter Valve - White', 'MISC/SHOP SUPPLIES', 'AMAZO', '3220AWT', 0, 19.45, 38.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3220AWT' OR UPPER(description) = 'TWO HANDLE SHOWER DIVERTER VALVE - WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '33-111', '1 Inch Urochrome Insrt Molding', 'MISC/SHOP SUPPLIES', 'TORK', '33-111', 0, 2.99, 4.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '33-111' OR UPPER(description) = '1 INCH UROCHROME INSRT MOLDING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3314471.017MC', 'Dometic Rv Air Conditioner Capacitor`', 'MISC/SHOP SUPPLIES', '.....', '3314471.017MC', 0, 48.15, 96.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3314471.017MC' OR UPPER(description) = 'DOMETIC RV AIR CONDITIONER CAPACITOR`');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎3316882900', 'Refrigerator Door Handle  Dm2882', 'MISC/SHOP SUPPLIES', 'AMAZO', '‎3316882900', 0, 7.99, 23.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎3316882900' OR UPPER(description) = 'REFRIGERATOR DOOR HANDLE  DM2882');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '34-4445', 'Valterra Seal Kit', 'MISC/SHOP SUPPLIES', 'CAMCO', '34-4445', 0, 6.39, 19.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '34-4445' OR UPPER(description) = 'VALTERRA SEAL KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '35-0100', 'Outdoor Shower Fixture', 'MISC/SHOP SUPPLIES', 'INTER', '35-0100', 0, 0.0, 35.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '35-0100' OR UPPER(description) = 'OUTDOOR SHOWER FIXTURE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '35-742-WT', 'Safe-T-Alert Dual Lp/Co Alarm', 'MISC/SHOP SUPPLIES', 'TORK', '35-742-WT', 0, 68.98, 103.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '35-742-WT' OR UPPER(description) = 'SAFE-T-ALERT DUAL LP/CO ALARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '364-6119', 'Scotch Loks Brown', 'MISC/SHOP SUPPLIES', 'AMAZO', '364-6119', 24, 0.87, 2.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '364-6119' OR UPPER(description) = 'SCOTCH LOKS BROWN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '364-X20', 'Micro Air Easy Start', 'MISC/SHOP SUPPLIES', 'LIPPE', '364-X20', 0, 299.0, 418.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '364-X20' OR UPPER(description) = 'MICRO AIR EASY START');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '365330-04', 'Black Adseal', 'MISC/SHOP SUPPLIES', 'TORK', '365330-04', 0, 20.52, 30.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '365330-04' OR UPPER(description) = 'BLACK ADSEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '371324-02', 'Front Window', 'MISC/SHOP SUPPLIES', 'INTER', '371324-02', 0, 632.28, 885.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '371324-02' OR UPPER(description) = 'FRONT WINDOW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '371380-01', 'Window 30" Egress', 'MISC/SHOP SUPPLIES', 'ETRAI', '371380-01', 0, 674.95, 877.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '371380-01' OR UPPER(description) = 'WINDOW 30" EGRESS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372088-101', 'Cs Window Corner', 'MISC/SHOP SUPPLIES', 'INTER', '', 0, 0.0, 1161.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372088-101' OR UPPER(description) = 'CS WINDOW CORNER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372089-101', 'Window Corner Cs Panoramic', 'MISC/SHOP SUPPLIES', 'ETRAI', '372089-101', 0, 959.0, 1246.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372089-101' OR UPPER(description) = 'WINDOW CORNER CS PANORAMIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11038', '1/0 3/8 Copper Lugs', 'MISC/SHOP SUPPLIES', 'TORK', '372-11038', 0, 1.99, 5.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11038' OR UPPER(description) = '1/0 3/8 COPPER LUGS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-112038', '2/0Ga 3/8 Lug Unplated Copper', 'ELECTRICAL', 'AMAZO', '', 0, 0.0, 2.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-112038' OR UPPER(description) = '2/0GA 3/8 LUG UNPLATED COPPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-112056', '2/0 Ga 5/16 Lug Unplated Copper', 'ELECTRICAL', 'TORK', '372-112056', 0, 1.75, 5.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-112056' OR UPPER(description) = '2/0 GA 5/16 LUG UNPLATED COPPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-114038', '4/0 Copper Lugs 4/0', 'MISC/SHOP SUPPLIES', 'TORK', '372-114038', 0, 2.76, 8.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-114038' OR UPPER(description) = '4/0 COPPER LUGS 4/0');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-114050', '4/0 1/2 Inch Hole', 'ELECTRICAL', 'TORK', '372-114050', 0, 2.76, 4.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-114050' OR UPPER(description) = '4/0 1/2 INCH HOLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11638', '6Ga 3/8 Lug Unplated Copper', 'ELECTRICAL', 'TORK', '372-11638', 0, 0.65, 1.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11638' OR UPPER(description) = '6GA 3/8 LUG UNPLATED COPPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11654', 'Batter Lugs 4 Ga', 'ELECTRICAL', 'TORK', '372-11656', 0, 5.9, 8.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11654' OR UPPER(description) = 'BATTER LUGS 4 GA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11656', 'Batter Lugs 6 Ga', 'ELECTRICAL', 'TORK', '372-11656', 0, 2.59, 7.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11656' OR UPPER(description) = 'BATTER LUGS 6 GA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11814', '2Ga 1/4 Lug Unplated Copper', 'ELECTRICAL', '.....', '372-11814', 0, 1.13, 3.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11814' OR UPPER(description) = '2GA 1/4 LUG UNPLATED COPPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '372-11838', '2Ga 3/8 Lug Unplated Copper', 'ELECTRICAL', '.....', '372-11838', 0, 1.1, 3.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '372-11838' OR UPPER(description) = '2GA 3/8 LUG UNPLATED COPPER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '380-97402', 'Heat Seal Connectors 12/10 Guage', 'MISC/SHOP SUPPLIES', 'ETRAI', '380-97402', 0, 0.79, 1.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '380-97402' OR UPPER(description) = 'HEAT SEAL CONNECTORS 12/10 GUAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '381065-10', '10" Cable - Compartment Door', 'MISC/SHOP SUPPLIES', 'TORK', '381065-10', 0, 5.12, 7.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '381065-10' OR UPPER(description) = '10" CABLE - COMPARTMENT DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '381318-060', 'Skylight Lid14-1/2X22 1/2', 'MISC/SHOP SUPPLIES', 'TORK', '381318-060', 0, 172.59, 241.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '381318-060' OR UPPER(description) = 'SKYLIGHT LID14-1/2X22 1/2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '381605-03', 'Piano Hinge, Stainless Steel For Rock Guard', 'MISC/SHOP SUPPLIES', 'RICH', '381605-03', 0, 42.67, 55.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '381605-03' OR UPPER(description) = 'PIANO HINGE, STAINLESS STEEL FOR ROCK GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382230-03', 'Compression Lock', 'MISC/SHOP SUPPLIES', 'INTER', '382230-03', 0, 0.0, 24.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382230-03' OR UPPER(description) = 'COMPRESSION LOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382-61', 'Battery Terminal Positive', 'MISC/SHOP SUPPLIES', 'E&G', '382-61', 0, 5.09, 10.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382-61' OR UPPER(description) = 'BATTERY TERMINAL POSITIVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '382-62', 'Battery Terminal Negative', 'MISC/SHOP SUPPLIES', 'TORK', '382-62', 0, 5.09, 10.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '382-62' OR UPPER(description) = 'BATTERY TERMINAL NEGATIVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3ST3500E-NOW', 'Dexter 3500Lb Straight Include Brakes', 'MISC/SHOP SUPPLIES', 'TORK', '3ST3500E-NOW', 0, 421.52, 716.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3ST3500E-NOW' OR UPPER(description) = 'DEXTER 3500LB STRAIGHT INCLUDE BRAKES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3ST3500NE-NOW', 'Dexter 3500 Lb Straight Axle W/ Never Adjust Elec', 'MISC/SHOP SUPPLIES', 'TORK', '3ST3500NE-NOW', 0, 444.08, 621.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3ST3500NE-NOW' OR UPPER(description) = 'DEXTER 3500 LB STRAIGHT AXLE W/ NEVER ADJUST ELEC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '3X004ELZ559', 'Victron Ve Direct  Cable', 'MISC/SHOP SUPPLIES', 'AMAZO', '3X004ELZ559', 1, 12.99, 25.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '3X004ELZ559' OR UPPER(description) = 'VICTRON VE DIRECT  CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4008-101-A65', 'Pentair Shurflo', 'PLUMBING', 'TORK', '4008-101-A65', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4008-101-A65' OR UPPER(description) = 'PENTAIR SHURFLO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '400914-03', 'Airstream 20" Stabilizer Jack', 'MISC/SHOP SUPPLIES', 'AMAZO', '400914-03', 0, 45.53, 63.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '400914-03' OR UPPER(description) = 'AIRSTREAM 20" STABILIZER JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '400914-04', 'Airstream Stabilizer Foot Pads - Set Of 4', 'MISC/SHOP SUPPLIES', 'WOOD', '400914-04', 0, 42.81, 59.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '400914-04' OR UPPER(description) = 'AIRSTREAM STABILIZER FOOT PADS - SET OF 4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '401027-01', 'Stabilizer Jack -Rs', 'MISC/SHOP SUPPLIES', 'ETRAI', '401027-01', 0, 83.1, 166.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '401027-01' OR UPPER(description) = 'STABILIZER JACK -RS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-002R', '2Ga Welding Wire Red', 'MISC/SHOP SUPPLIES', '.....', '404-002R', 0, 2.73, 8.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-002R' OR UPPER(description) = '2GA WELDING WIRE RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-02', '2Ga Welding Wire Cable Black', 'MISC/SHOP SUPPLIES', '.....', '404-02', 0, 2.73, 8.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-02' OR UPPER(description) = '2GA WELDING WIRE CABLE BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-06R', '20 Ft 6 Ga Wire Red', 'MISC/SHOP SUPPLIES', 'E&G', '404-06R', 0, 18.82, 31.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-06R' OR UPPER(description) = '20 FT 6 GA WIRE RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-08', '8Ga Welding Cable *Red8Ga Flexaprene Xx 250Ft  Spo', 'MISC/SHOP SUPPLIES', 'E&G', '404-08', 0, 14.32, 28.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-08' OR UPPER(description) = '8GA WELDING CABLE *RED8GA FLEXAPRENE XX 250FT  SPO');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-09', '8Ga Welding Cable *Red* 8Ga Flexaprene Xx 250Ft  S', 'MISC/SHOP SUPPLIES', 'E&G', '404-09', 0, 14.32, 28.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-09' OR UPPER(description) = '8GA WELDING CABLE *RED* 8GA FLEXAPRENE XX 250FT  S');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-10', '1/0Ga Welding Cable Black', 'MISC/SHOP SUPPLIES', 'TORK', '404-10', 0, 3.6, 7.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-10' OR UPPER(description) = '1/0GA WELDING CABLE BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-10R', '1/0 Welding Cable Red', 'MISC/SHOP SUPPLIES', 'TORK', '404-10R', 0, 3.89, 7.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-10R' OR UPPER(description) = '1/0 WELDING CABLE RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-20', '2/0Ga Welding Cable Black Flexaprene 12''', 'MISC/SHOP SUPPLIES', 'TORK', '404-20', 0, 3.9, 11.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-20' OR UPPER(description) = '2/0GA WELDING CABLE BLACK FLEXAPRENE 12''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-20R', '2/0Ga Welding Cable Red Plexaprene 12''', 'MISC/SHOP SUPPLIES', 'TORK', '404-20R', 0, 3.9, 11.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-20R' OR UPPER(description) = '2/0GA WELDING CABLE RED PLEXAPRENE 12''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-40', '4/0 Welding Cable Black', 'MISC/SHOP SUPPLIES', 'TORK', '404-40', 0, 6.52, 12.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-40' OR UPPER(description) = '4/0 WELDING CABLE BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '404-40R', '4/0 Red Flexaprene Xx Red Welding Cable', 'MISC/SHOP SUPPLIES', 'TORK', '404-40R', 0, 6.52, 12.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '404-40R' OR UPPER(description) = '4/0 RED FLEXAPRENE XX RED WELDING CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '41-1890', 'Thermostat,Heat Only,Whit', 'MISC/SHOP SUPPLIES', 'NTP', '38453', 1, 28.71, 38.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '41-1890' OR UPPER(description) = 'THERMOSTAT,HEAT ONLY,WHIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '413-1021', '10-2 Grey Jacketed Wire 100Ft', 'MISC/SHOP SUPPLIES', 'TORK', '413-1021', 0, 1.47, 2.35, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '413-1021' OR UPPER(description) = '10-2 GREY JACKETED WIRE 100FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '413-az', 'Digest-It Black Holding Tank Treatment -', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 3, 0.0, 25.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '413-az' OR UPPER(description) = 'DIGEST-IT BLACK HOLDING TANK TREATMENT -');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '41G-4', 'Rv Digest-It Holding Tank Treatment', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 25.99, 36.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '41G-4' OR UPPER(description) = 'RV DIGEST-IT HOLDING TANK TREATMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42-0275', 'Gasket Kit  Atwood', 'MISC/SHOP SUPPLIES', 'NTP', '96010', 1, 25.28, 35.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42-0275' OR UPPER(description) = 'GASKET KIT  ATWOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '421-52100', '3/4 Split Llome Black', 'HARDWARE', 'TORK', '421-52100', 0, 0.48, 1.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '421-52100' OR UPPER(description) = '3/4 SPLIT LLOME BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '421-64', '1 1/2" Slit Loom- Black', 'MISC/SHOP SUPPLIES', 'TORK', '421-64', 0, 2.97, 4.31, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '421-64' OR UPPER(description) = '1 1/2" SLIT LOOM- BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '421-921', '921 Bulb', 'MISC/SHOP SUPPLIES', '.....', '421-921', 0, 0.49, 1.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '421-921' OR UPPER(description) = '921 BULB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42656-5.2KUC3', '12X2" 6 On 51/2" Brum', 'MISC/SHOP SUPPLIES', 'TORK', '42656-5.2KUC3', 0, 91.61, 183.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42656-5.2KUC3' OR UPPER(description) = '12X2" 6 ON 51/2" BRUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42656-I', 'Inport Hub&Drum Assm', 'MISC/SHOP SUPPLIES', 'TORK', '42656-I', 0, 76.52, 153.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42656-I' OR UPPER(description) = 'INPORT HUB&DRUM ASSM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42656UC3', 'Hub&Drum Complete 6 On 5.50 #42', 'MISC/SHOP SUPPLIES', 'TORK', '42656UC3', 0, 92.07, 138.11, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42656UC3' OR UPPER(description) = 'HUB&DRUM COMPLETE 6 ON 5.50 #42');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '42656UC3-EZ-I', 'Hub&Drum Complete6 0N', 'MISC/SHOP SUPPLIES', 'TORK', '42656UC3-EZ', 0, 76.02, 114.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '42656UC3-EZ-I' OR UPPER(description) = 'HUB&DRUM COMPLETE6 0N');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4400TAU', 'Parallax Power Supply', 'ELECTRICAL', 'TORK', '4400TAU', 0, 59.48, 118.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4400TAU' OR UPPER(description) = 'PARALLAX POWER SUPPLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '444-4616', '1/2X6In Dual Wall Red Ht Shrink Tubing', 'MISC/SHOP SUPPLIES', 'TORK', '444-4616', 0, 5.64, 11.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '444-4616' OR UPPER(description) = '1/2X6IN DUAL WALL RED HT SHRINK TUBING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '444-4626', '1/2X6 Dual Wall Ht Shrnk Black Tubing', 'ELECTRICAL', 'TORK', '444-4626', 0, 5.64, 11.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '444-4626' OR UPPER(description) = '1/2X6 DUAL WALL HT SHRNK BLACK TUBING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '444-52148', '3/4" Red Wall Heat Shrink', 'MISC/SHOP SUPPLIES', 'TORK', '444-52148', 0, 2.67, 5.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '444-52148' OR UPPER(description) = '3/4" RED WALL HEAT SHRINK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '444-52248', '3/4" Black Wall Heat Shrink', 'MISC/SHOP SUPPLIES', 'TORK', '444-52248', 0, 2.67, 5.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '444-52248' OR UPPER(description) = '3/4" BLACK WALL HEAT SHRINK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '444-56248', '1" Black Heat Shrink', 'MISC/SHOP SUPPLIES', 'TORK', '444-56248', 0, 2.26, 6.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '444-56248' OR UPPER(description) = '1" BLACK HEAT SHRINK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4454-52248', '3/4 Dual Wall Heat Shrink Black', 'MISC/SHOP SUPPLIES', 'TORK', '4454-52248', 0, 2.25, 4.05, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4454-52248' OR UPPER(description) = '3/4 DUAL WALL HEAT SHRINK BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '44-US07R', 'Antenna Side Mount Rubber', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 32.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '44-US07R' OR UPPER(description) = 'ANTENNA SIDE MOUNT RUBBER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '450-321', 'Black Tie  Base', 'MISC/SHOP SUPPLIES', '.....', '450-321', 0, 0.3, 0.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '450-321' OR UPPER(description) = 'BLACK TIE  BASE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '450-T30RO', '6" Black Ties', 'MISC/SHOP SUPPLIES', '.....', '450-T30RO', 0, 0.5, 1.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '450-T30RO' OR UPPER(description) = '6" BLACK TIES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '454-64', '1 1/2 Metal Loom Clamps (#24)', 'MISC/SHOP SUPPLIES', 'E&G', '', 10, 0.0, 2.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '454-64' OR UPPER(description) = '1 1/2 METAL LOOM CLAMPS (#24)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4552 220927/153948', 'White Adseal Sealant', 'MISC/SHOP SUPPLIES', 'TORK', '4552 220927/153948', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4552 220927/153948' OR UPPER(description) = 'WHITE ADSEAL SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '455-38', 'Adseal Grey Galvanized Aluminum', 'MISC/SHOP SUPPLIES', 'AMAZO', '455-38', 12, 0.0, 23.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '455-38' OR UPPER(description) = 'ADSEAL GREY GALVANIZED ALUMINUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '455-52248', '3/4 Black Heat Shrink', 'MISC/SHOP SUPPLIES', '.....', '455-52248', 0, 7.29, 21.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '455-52248' OR UPPER(description) = '3/4 BLACK HEAT SHRINK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '464-62', '1 3/8 Grommet', 'MISC/SHOP SUPPLIES', 'TORK', '464-62', 0, 4.32, 7.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '464-62' OR UPPER(description) = '1 3/8 GROMMET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4756C', 'Chrome Lug Nuts', 'MISC/SHOP SUPPLIES', 'IRON', '4756C', 0, 1.5, 2.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4756C' OR UPPER(description) = 'CHROME LUG NUTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4P4C', 'Modular Plug', 'MISC/SHOP SUPPLIES', 'TORK', '4P4C', 0, 5.59, 11.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4P4C' OR UPPER(description) = 'MODULAR PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '4XZS-RV-Y', 'Sae Y Connector', 'MISC/SHOP SUPPLIES', 'GOPOW', '4XZS-RV-Y', 0, 0.0, 8.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '4XZS-RV-Y' OR UPPER(description) = 'SAE Y CONNECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5/8VTX', '5/8"  Bottom Molding Insert - 50 Ft', 'MISC/SHOP SUPPLIES', 'TORK', '5/8VTX', 0, 19.99, 39.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5/8VTX' OR UPPER(description) = '5/8"  BOTTOM MOLDING INSERT - 50 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LSD', 'Lap Sealant Dicor', 'MISC/SHOP SUPPLIES', 'TORK', '501LSD', 0, 0.0, 18.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LSD' OR UPPER(description) = 'LAP SEALANT DICOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501-LSD', 'Roof Lap Seal White', 'MISC/SHOP SUPPLIES', 'TORK', '501-LSD', 0, 0.0, 17.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501-LSD' OR UPPER(description) = 'ROOF LAP SEAL WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LSD-1', 'Dicor Corp 501Lsd-1 Rv Maintenance And Repair (501', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 151.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LSD-1' OR UPPER(description) = 'DICOR CORP 501LSD-1 RV MAINTENANCE AND REPAIR (501');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LST', 'Tan Dicor Roof Sealant', 'MISC/SHOP SUPPLIES', 'TORK', '501LST', 0, 11.79, 16.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LST' OR UPPER(description) = 'TAN DICOR ROOF SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LSV', 'Lap Sealant Ivory Dicor Roof Sealant', 'MISC/SHOP SUPPLIES', 'TORK', '501LSV', 0, 13.79, 20.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LSV' OR UPPER(description) = 'LAP SEALANT IVORY DICOR ROOF SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LSW', 'Dicor White Lap Sealant -Self Leveling', 'MISC/SHOP SUPPLIES', 'AMAZO', '501LSW', 0, 7.51, 15.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LSW' OR UPPER(description) = 'DICOR WHITE LAP SEALANT -SELF LEVELING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '501LSW-1', 'Dicor Self Leveling Roof Seal - White', 'MISC/SHOP SUPPLIES', '.....', '501LSW-1', 8, 9.99, 29.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '501LSW-1' OR UPPER(description) = 'DICOR SELF LEVELING ROOF SEAL - WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '50-230', 'Multi-Plus Inverter 12/3000/120V Victron', 'MISC/SHOP SUPPLIES', 'AMAZO', '50-230', 0, 1714.45, 1872.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '50-230' OR UPPER(description) = 'MULTI-PLUS INVERTER 12/3000/120V VICTRON');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5050swd-ww', '12V. 16.5 Led Strip Light', 'MISC/SHOP SUPPLIES', 'TORK', '5050swd-ww', 0, 11.99, 23.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5050swd-ww' OR UPPER(description) = '12V. 16.5 LED STRIP LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '50-67-003', '7 Way 8'' Trailer End Plug', 'MISC/SHOP SUPPLIES', 'AMAZO', '50-67-003', 2, 44.56, 64.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '50-67-003' OR UPPER(description) = '7 WAY 8'' TRAILER END PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '511017-11', 'Exterior Vent, Gray', 'HVAC', 'INTER', '', 0, 0.0, 30.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '511017-11' OR UPPER(description) = 'EXTERIOR VENT, GRAY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512210-106', 'Baraldi Motor For Range Hood', 'MISC/SHOP SUPPLIES', '.....', '512210-106', 0, 121.93, 158.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512210-106' OR UPPER(description) = 'BARALDI MOTOR FOR RANGE HOOD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512539-01', 'Atwood Lp Detector', 'MISC/SHOP SUPPLIES', 'TORK', '512539-01', 0, 118.0, 165.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512539-01' OR UPPER(description) = 'ATWOOD LP DETECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '512918-03', 'Led Lights Flex Strip Tape 20Ft', 'MISC/SHOP SUPPLIES', 'INTER', '512918-03', 1, 237.38, 332.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '512918-03' OR UPPER(description) = 'LED LIGHTS FLEX STRIP TAPE 20FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '51S01', 'Seaflo Water Pump Filter', 'MISC/SHOP SUPPLIES', 'TORK', '51S01', 0, 9.99, 19.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '51S01' OR UPPER(description) = 'SEAFLO WATER PUMP FILTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '52-249P', 'Pollak Juction Block Box', 'MISC/SHOP SUPPLIES', 'TORK', '52-249P', 0, 0.0, 71.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '52-249P' OR UPPER(description) = 'POLLAK JUCTION BLOCK BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5239A', 'Suburban Water Heater', 'MISC/SHOP SUPPLIES', 'AMAZO', '5239A', 0, 412.5, 577.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5239A' OR UPPER(description) = 'SUBURBAN WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '54014-06', 'Brass Tube Fittings 3/8"', 'MISC/SHOP SUPPLIES', 'AMAZO', '54014-06', 0, 2.75, 4.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '54014-06' OR UPPER(description) = 'BRASS TUBE FITTINGS 3/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '551LSW', 'Dicor White  Non-Sag', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 8.5, 17.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '551LSW' OR UPPER(description) = 'DICOR WHITE  NON-SAG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '56116-04', '1/4'' X1/4 Male Pipe Tofemale Elbow Pipe', 'PLUMBING', 'TORK', '56116-04', 0, 7.22, 21.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '56116-04' OR UPPER(description) = '1/4'' X1/4 MALE PIPE TOFEMALE ELBOW PIPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '565MF BB1DEK', '12V. Engine Battery', 'ELECTRICAL', 'TORK', '565MF BB1DEK', 0, 90.6, 117.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '565MF BB1DEK' OR UPPER(description) = '12V. ENGINE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5800W', 'Putty Tape Roll', 'MISC/SHOP SUPPLIES', '.....', '5800W', 0, 6.0, 13.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5800W' OR UPPER(description) = 'PUTTY TAPE ROLL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '59462-B-PK', 'Delta Shower Head 2.5Gpm', 'MISC/SHOP SUPPLIES', 'AMAZO', '59462-B-PK', 0, 36.98, 55.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '59462-B-PK' OR UPPER(description) = 'DELTA SHOWER HEAD 2.5GPM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '5-R20', '20 Amp Black Gfci Outlet', 'MISC/SHOP SUPPLIES', '.....', '5-R20', 0, 12.99, 25.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '5-R20' OR UPPER(description) = '20 AMP BLACK GFCI OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '600-108B-08', '1/2 Inch Pipe Cap Brass', 'PLUMBING', '.....', '600-108B-08', 0, 3.28, 9.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '600-108B-08' OR UPPER(description) = '1/2 INCH PIPE CAP BRASS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '600312.331C', 'Penquin Ac - Dometic', 'MISC/SHOP SUPPLIES', 'TORK', '600312.331C', 0, 1056.05, 1478.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '600312.331C' OR UPPER(description) = 'PENQUIN AC - DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '604877-01', 'Shower Faucet Airstream Special', 'MISC/SHOP SUPPLIES', 'AMAZO', '604877-01', 1, 24.94, 37.41, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '604877-01' OR UPPER(description) = 'SHOWER FAUCET AIRSTREAM SPECIAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '62-1582', 'Ktn 8, Ch, Hr, Pl', 'DOORS/WINDOWS/AWNINGS', 'NTP', 'PF211325', 0, 30.42, 59.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '62-1582' OR UPPER(description) = 'KTN 8, CH, HR, PL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '62-4328', 'Battery Box - Double End-', 'ELECTRICAL', 'NTP', '55374', 1, 17.76, 23.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '62-4328' OR UPPER(description) = 'BATTERY BOX - DOUBLE END-');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6258APW', 'Suburban Furnace Access Door - White', 'MISC/SHOP SUPPLIES', 'ADFAS', '6258APW', 0, 56.76, 85.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6258APW' OR UPPER(description) = 'SUBURBAN FURNACE ACCESS DOOR - WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '640-1201', 'Cartridge Clear Silicone', 'MISC/SHOP SUPPLIES', '.....', '640-1201', 0, 7.66, 19.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '640-1201' OR UPPER(description) = 'CARTRIDGE CLEAR SILICONE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '64-0941', 'Stabilizer Jack Crank Handle', 'MISC/SHOP SUPPLIES', 'TORK', '64-0941', 0, 10.39, 20.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '64-0941' OR UPPER(description) = 'STABILIZER JACK CRANK HANDLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '64-998', 'Branch Y Connector', 'MISC/SHOP SUPPLIES', '.....', '64-998', 0, 15.98, 31.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '64-998' OR UPPER(description) = 'BRANCH Y CONNECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '649MF', 'Deka Led Acid Battery Filled', 'MISC/SHOP SUPPLIES', 'TORK', '649MF', 0, 126.02, 214.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '649MF' OR UPPER(description) = 'DEKA LED ACID BATTERY FILLED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6522KTRI', 'Blue Magic 6522Ktri Quiksteel Plastic Tank Repair', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 14.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6522KTRI' OR UPPER(description) = 'BLUE MAGIC 6522KTRI QUIKSTEEL PLASTIC TANK REPAIR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '660-20', '2" Gorilla Tape 30 Yd', 'MISC/SHOP SUPPLIES', 'E&G', '660-20', 0, 31.07, 40.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '660-20' OR UPPER(description) = '2" GORILLA TAPE 30 YD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '660-6', 'Flat Double Face Foam Tape', 'MISC/SHOP SUPPLIES', '.....', '660-6', 0, 2.38, 7.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '660-6' OR UPPER(description) = 'FLAT DOUBLE FACE FOAM TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '665MF BB1DEK', 'Sealed Wett Battery From Hensley', 'MISC/SHOP SUPPLIES', 'TORK', '665MF BB1DEK', 0, 114.9, 160.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '665MF BB1DEK' OR UPPER(description) = 'SEALED WETT BATTERY FROM HENSLEY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '66n4ab96gm', '3 Inch Black Tank Gate Valve', 'MISC/SHOP SUPPLIES', '89', '66n4ab96gm', 0, 89.89, 179.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '66n4ab96gm' OR UPPER(description) = '3 INCH BLACK TANK GATE VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6733-3221', 'Coleman-Mach Fan Blade', 'MISC/SHOP SUPPLIES', 'TORK', '6733-3221', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6733-3221' OR UPPER(description) = 'COLEMAN-MACH FAN BLADE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '682616-100-3', 'Olympic Rivets', 'MISC/SHOP SUPPLIES', 'TORK', '682616-100-3', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '682616-100-3' OR UPPER(description) = 'OLYMPIC RIVETS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '682616-100-4', 'Olympic Rivet', 'MISC/SHOP SUPPLIES', 'AS IE', '682616-100-4', 302, 0.66, 1.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '682616-100-4' OR UPPER(description) = 'OLYMPIC RIVET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685275-101', 'Stoneguard Cs Solar Gray', 'MISC/SHOP SUPPLIES', 'INTER', '685275-101', 0, 572.51, 801.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685275-101' OR UPPER(description) = 'STONEGUARD CS SOLAR GRAY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685275-102', 'Rs Window Stone Guard', 'MISC/SHOP SUPPLIES', 'ETRAI', '685275-102', 0, 539.95, 710.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685275-102' OR UPPER(description) = 'RS WINDOW STONE GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685275-103', 'Center Pc  Stone Guard', 'MISC/SHOP SUPPLIES', 'ETRAI', '685275-103', 0, 809.1, 1051.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685275-103' OR UPPER(description) = 'CENTER PC  STONE GUARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685365-100', 'Segment Protector Passenger Side', 'MISC/SHOP SUPPLIES', 'ETRAI', '685365-100', 0, 649.04, 843.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685365-100' OR UPPER(description) = 'SEGMENT PROTECTOR PASSENGER SIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '685366-100', 'Segment Protector Driver Side', 'MISC/SHOP SUPPLIES', 'ETRAI', '685366-100', 0, 649.04, 843.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '685366-100' OR UPPER(description) = 'SEGMENT PROTECTOR DRIVER SIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-CT-173B-SS', 'Cooktop 3 Burner Stainless Glasstop', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-CT-173B-SS', 0, 264.55, 370.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-CT-173B-SS' OR UPPER(description) = 'COOKTOP 3 BURNER STAINLESS GLASSTOP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '69-3702', 'Shroud,12"', 'MISC/SHOP SUPPLIES', 'NTP', '3309518.003', 0, 201.47, 269.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '69-3702' OR UPPER(description) = 'SHROUD,12"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '69-4460', 'Valve Kit, Water', 'MISC/SHOP SUPPLIES', 'NTP', '385311641', 1, 49.71, 55.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '69-4460' OR UPPER(description) = 'VALVE KIT, WATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '69-9477', 'Shw 4, Wt, Vb, Qtr', 'DOORS/WINDOWS/AWNINGS', 'NTP', 'PF223242', 0, 15.09, 24.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '69-9477' OR UPPER(description) = 'SHW 4, WT, VB, QTR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6JC101010721017', 'Mpt Brass Reducing Hex Nipla 1/2 To 1/4 "', 'PLUMBING', 'TORK', '6JC101010721017', 0, 6.99, 20.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6JC101010721017' OR UPPER(description) = 'MPT BRASS REDUCING HEX NIPLA 1/2 TO 1/4 "');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '6K-BK-EZ', 'Bearing Seal Kit', 'MISC/SHOP SUPPLIES', 'TORK', '6K-BK-EZ', 0, 12.99, 25.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '6K-BK-EZ' OR UPPER(description) = 'BEARING SEAL KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '700-10605', 'Insulated 1" Clamp', 'ELECTRICAL', 'TORK', '700-10605', 0, 1.27, 2.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '700-10605' OR UPPER(description) = 'INSULATED 1" CLAMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '70-3152', 'Roof Membrane Diflex 25'' X 8.6"', 'MISC/SHOP SUPPLIES', 'ETRAI', '70-3152', 0, 415.02, 658.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '70-3152' OR UPPER(description) = 'ROOF MEMBRANE DIFLEX 25'' X 8.6"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '703911-100', 'Sweep Shower Door', 'MISC/SHOP SUPPLIES', 'AS IE', '703911-100', 1, 10.7, 14.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '703911-100' OR UPPER(description) = 'SWEEP SHOWER DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '703911-100 AS 2-21', 'Sweep-Shower Door', 'MISC/SHOP SUPPLIES', 'TORK', '703911-100 AS 2-21', 0, 0.0, 18.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '703911-100 AS 2-21' OR UPPER(description) = 'SWEEP-SHOWER DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '704783-01', 'Airstream Shower Door Assembly', 'MISC/SHOP SUPPLIES', 'AS IE', '704783-01', 0, 260.0, 417.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '704783-01' OR UPPER(description) = 'AIRSTREAM SHOWER DOOR ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '704824-01', 'Awning Arm Hardware', 'MISC/SHOP SUPPLIES', 'ZIPD', '704824-01', 0, 0.0, 729.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '704824-01' OR UPPER(description) = 'AWNING ARM HARDWARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '704824-08', 'Fabric And Tube Awning', 'MISC/SHOP SUPPLIES', 'ZIPD', '704824-08', 0, 1523.0, 2132.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '704824-08' OR UPPER(description) = 'FABRIC AND TUBE AWNING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-46238', 'Atc Fuse Holder 10G', 'MISC/SHOP SUPPLIES', 'TORK', '716-46238', 0, 1.81, 5.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-46238' OR UPPER(description) = 'ATC FUSE HOLDER 10G');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-46449', 'Atc 16 Ga Fuse Holder W Cap', 'MISC/SHOP SUPPLIES', 'E&G', '', 0, 0.0, 8.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-46449' OR UPPER(description) = 'ATC 16 GA FUSE HOLDER W CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-AMG200', '200 Amp Super Fuse', 'MISC/SHOP SUPPLIES', '.....', '716-AMG200', 0, 15.23, 30.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-AMG200' OR UPPER(description) = '200 AMP SUPER FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-AMG60', 'Mega Fuse 60A', 'MISC/SHOP SUPPLIES', 'E&G', '716-AMG60', 0, 9.42, 18.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-AMG60' OR UPPER(description) = 'MEGA FUSE 60A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-ANN400', '400 Amp Buss Super Fuse', 'MISC/SHOP SUPPLIES', 'ETRAI', '716-ANN400', 0, 31.12, 62.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-ANN400' OR UPPER(description) = '400 AMP BUSS SUPER FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-CBBF150', '150 Amp Buss Super Fuse', 'MISC/SHOP SUPPLIES', 'TORK', '716-CBBF150', 0, 7.08, 21.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-CBBF150' OR UPPER(description) = '150 AMP BUSS SUPER FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '716-HHG', 'Atc Fuse Holder W Cap', 'MISC/SHOP SUPPLIES', 'TORK', '716-HHG', 0, 3.66, 7.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '716-HHG' OR UPPER(description) = 'ATC FUSE HOLDER W CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '71-8552', '6Pk Aqua Pro Water Pump 3', 'MISC/SHOP SUPPLIES', 'NTP', '21849', 0, 275.04, 553.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '71-8552' OR UPPER(description) = '6PK AQUA PRO WATER PUMP 3');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '72-6167', 'Roof Vent - Powered', 'MISC/SHOP SUPPLIES', 'NTP', 'V2094-603-00', 2, 114.97, 160.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '72-6167' OR UPPER(description) = 'ROOF VENT - POWERED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '72-7762', 'Durapatch Uv 9" X 12"', 'MISC/SHOP SUPPLIES', 'NTP', '56714', 1, 41.33, 51.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '72-7762' OR UPPER(description) = 'DURAPATCH UV 9" X 12"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '732-30055-40', '40 Amp Circuit Breaker', 'MISC/SHOP SUPPLIES', 'TORK', '732-30055-40', 0, 5.66, 16.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '732-30055-40' OR UPPER(description) = '40 AMP CIRCUIT BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '732-30056-30', 'Circuit Breaker 12 V 30A', 'MISC/SHOP SUPPLIES', 'E&G', '732-30056-30', 0, 6.3, 9.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '732-30056-30' OR UPPER(description) = 'CIRCUIT BREAKER 12 V 30A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '732-5582', 'On/Off Toggle Switch 12V. For Lp', 'MISC/SHOP SUPPLIES', 'E&G', '732-5582', 0, 0.0, 7.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '732-5582' OR UPPER(description) = 'ON/OFF TOGGLE SWITCH 12V. FOR LP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '732-RC400112NN', 'Relay 5-Terminal', 'MISC/SHOP SUPPLIES', 'E&G', '732-RC400112NN', 0, 3.12, 9.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '732-RC400112NN' OR UPPER(description) = 'RELAY 5-TERMINAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '732-RC400112RN', 'Cole Herse Relay Metal Tab', 'MISC/SHOP SUPPLIES', '.....', '732-RC400112RN', 0, 7.99, 23.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '732-RC400112RN' OR UPPER(description) = 'COLE HERSE RELAY METAL TAB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '73376W-01', 'Patio Awning Travel Latch Zip Dee', 'MISC/SHOP SUPPLIES', 'TORK', '73376W-01', 0, 39.5, 79.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '73376W-01' OR UPPER(description) = 'PATIO AWNING TRAVEL LATCH ZIP DEE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '733OA3231', 'Compresor Thermal Bulb Coleman', 'MISC/SHOP SUPPLIES', 'AMAZO', '733OA3231', 0, 13.99, 27.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '733OA3231' OR UPPER(description) = 'COMPRESOR THERMAL BULB COLEMAN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '73-9952', 'Motor 12V Furance', 'HVAC', 'NTP', '30722MC', 0, 101.89, 140.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '73-9952' OR UPPER(description) = 'MOTOR 12V FURANCE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '77201-01', 'Truma Access Door 15X15', 'MISC/SHOP SUPPLIES', '.....', '77201-01', 0, 78.99, 134.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '77201-01' OR UPPER(description) = 'TRUMA ACCESS DOOR 15X15');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '772-14305', 'Lighted 12V. Switch', 'MISC/SHOP SUPPLIES', 'TORK', '772-14305', 0, 8.59, 15.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '772-14305' OR UPPER(description) = 'LIGHTED 12V. SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '78103-01', 'Truma Aquago Instant Water Heater', 'MISC/SHOP SUPPLIES', '.....', '78103-01', 0, 1536.0, 1996.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '78103-01' OR UPPER(description) = 'TRUMA AQUAGO INSTANT WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '78107LL', 'Airstream Low Point Drain Valve', 'MISC/SHOP SUPPLIES', 'TORK', '78107LL', 0, 33.02, 66.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '78107LL' OR UPPER(description) = 'AIRSTREAM LOW POINT DRAIN VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '78220REVA', 'Go Power Solar Expansion Kit', 'MISC/SHOP SUPPLIES', 'RICH', '78220REVA', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '78220REVA' OR UPPER(description) = 'GO POWER SOLAR EXPANSION KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '7842A', 'Eq Systems Jacks', 'MISC/SHOP SUPPLIES', '.....', '7842A', 0, 338.81, 474.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '7842A' OR UPPER(description) = 'EQ SYSTEMS JACKS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '7970A', 'Eq Systems Cross Bar', 'TOWING/CHASSIS', '.....', '7970A', 0, 30.78, 52.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '7970A' OR UPPER(description) = 'EQ SYSTEMS CROSS BAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '80-00-2060', '12V. Brake-A- Way With Cable', 'ELECTRICAL', 'TORK', '80-00-2060', 0, 39.98, 79.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '80-00-2060' OR UPPER(description) = '12V. BRAKE-A- WAY WITH CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '80-0490', 'We Boost Cell Phone Booster', 'MISC/SHOP SUPPLIES', 'NTP', '470354', 1, 449.46, 519.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '80-0490' OR UPPER(description) = 'WE BOOST CELL PHONE BOOSTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '800507-03', 'Bed Platform', 'MISC/SHOP SUPPLIES', 'TORK', '800507-03', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '800507-03' OR UPPER(description) = 'BED PLATFORM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '816-15409K', 'Grey Mounting Bracket Kit', 'MISC/SHOP SUPPLIES', 'E&G', '816-15409K', 0, 0.0, 4.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '816-15409K' OR UPPER(description) = 'GREY MOUNTING BRACKET KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '816-154R', 'Sealed Clearance/Marker Light', 'MISC/SHOP SUPPLIES', 'E&G', '816-154R', 0, 2.71, 3.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '816-154R' OR UPPER(description) = 'SEALED CLEARANCE/MARKER LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '816-161R', 'Led Red Marker Light', 'MISC/SHOP SUPPLIES', 'TORK', '816-161R', 0, 15.25, 30.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '816-161R' OR UPPER(description) = 'LED RED MARKER LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '835-146', 'Rapid Seal Rubberized Coating', 'MISC/SHOP SUPPLIES', '.....', '835-146', 0, 15.05, 30.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '835-146' OR UPPER(description) = 'RAPID SEAL RUBBERIZED COATING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84546UC3', 'Hub & Drum Complete #84 5 On 4.50 1/2 "Stud Grease', 'MISC/SHOP SUPPLIES', 'IRON', '84546UC3', 0, 62.91, 88.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84546UC3' OR UPPER(description) = 'HUB & DRUM COMPLETE #84 5 ON 4.50 1/2 "STUD GREASE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84546UC3-EZ', 'Hub & Drum Complete #84 5 On 4.50 1/2 Stud Ez-Lube', 'MISC/SHOP SUPPLIES', 'TORK', '84546UC3-EZ', 0, 63.29, 94.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84546UC3-EZ' OR UPPER(description) = 'HUB & DRUM COMPLETE #84 5 ON 4.50 1/2 STUD EZ-LUBE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84546UC3-EZ-I', 'Hub & Drum Complete', 'MISC/SHOP SUPPLIES', 'TORK', '84546UC3-EZ-I', 0, 55.19, 110.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84546UC3-EZ-I' OR UPPER(description) = 'HUB & DRUM COMPLETE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8456UC3-EZ', 'Dexture Drum 10X21/4" 3500Lb.', 'MISC/SHOP SUPPLIES', 'TORK', '8456UC3-EZ', 0, 86.95, 126.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8456UC3-EZ' OR UPPER(description) = 'DEXTURE DRUM 10X21/4" 3500LB.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '84656UC3-EZ', '10" Hub And Drum W/ Bearings And Race', 'MISC/SHOP SUPPLIES', 'TORK', '84656UC3-EZ', 0, 89.56, 152.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '84656UC3-EZ' OR UPPER(description) = '10" HUB AND DRUM W/ BEARINGS AND RACE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8500B', 'Grey Elastic Putty Tape 1/8X3/4X30''', 'MISC/SHOP SUPPLIES', 'TORK', '8500B', 0, 8.29, 16.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8500B' OR UPPER(description) = 'GREY ELASTIC PUTTY TAPE 1/8X3/4X30''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8952003.400UL', 'Dometic 9200 Power Awning Arms Set', 'MISC/SHOP SUPPLIES', '.....', '8952003.400UL', 0, 530.26, 877.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8952003.400UL' OR UPPER(description) = 'DOMETIC 9200 POWER AWNING ARMS SET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '89-8478', 'Valterra 3" Gate Valve Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '89-8478', 0, 24.07, 48.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '89-8478' OR UPPER(description) = 'VALTERRA 3" GATE VALVE ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8A24M', '27M Deep Cycle Agm Battery', 'MISC/SHOP SUPPLIES', 'TORK', '8A24M', 0, 131.05, 262.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8A24M' OR UPPER(description) = '27M DEEP CYCLE AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8A24M BG5DEK', 'Group 24 Agm Battery Dekka', 'MISC/SHOP SUPPLIES', '.....', '8A24M BG5DEK', 0, 192.7, 269.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8A24M BG5DEK' OR UPPER(description) = 'GROUP 24 AGM BATTERY DEKKA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8a31dtm bg5dek', 'Group 31 Hensley Agm Battery', 'MISC/SHOP SUPPLIES', 'TORK', '8a31dtm bg5dek', 0, 151.89, 338.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8a31dtm bg5dek' OR UPPER(description) = 'GROUP 31 HENSLEY AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8A31DTM-BG5DEK', 'Group 31 Agm Rv Marine Battery', 'MISC/SHOP SUPPLIES', 'TORK', '8A31DTM-BG5DEK', 0, 437.17, 612.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8A31DTM-BG5DEK' OR UPPER(description) = 'GROUP 31 AGM RV MARINE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8A8D/T975', 'Deka  245 Ah Agm Battery', 'MISC/SHOP SUPPLIES', 'DOM', '8A8D/T975', 0, 0.0, 1011.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8A8D/T975' OR UPPER(description) = 'DEKA  245 AH AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8CECC', 'Terminal Closed End Nylon-Ins 16-10 Gauge', 'MISC/SHOP SUPPLIES', 'RAM', '', 0, 0.0, 0.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8CECC' OR UPPER(description) = 'TERMINAL CLOSED END NYLON-INS 16-10 GAUGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '8X34PT', 'Tek Screw Phillips Pan Head #8X3/4"', 'MISC/SHOP SUPPLIES', 'RAM', '', 100, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '8X34PT' OR UPPER(description) = 'TEK SCREW PHILLIPS PAN HEAD #8X3/4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90-00-100', 'Hitch 10K Equalizer Brand', 'MISC/SHOP SUPPLIES', 'LIPPE', '90-00-100', 0, 0.0, 948.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90-00-100' OR UPPER(description) = 'HITCH 10K EQUALIZER BRAND');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9014-3', 'Battery  Box Strap', 'MISC/SHOP SUPPLIES', 'AMAZO', '9014-3', 3, 5.76, 11.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9014-3' OR UPPER(description) = 'BATTERY  BOX STRAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90-2079', '17'' Awning Fabric-16''-1" Actual, Black Fad To Wht.', 'MISC/SHOP SUPPLIES', 'NTP', '90-2079', 0, 218.26, 360.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90-2079' OR UPPER(description) = '17'' AWNING FABRIC-16''-1" ACTUAL, BLACK FAD TO WHT.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '90-3439-244-RV', 'Window Weatherstrip 15 Foot Strip', 'MISC/SHOP SUPPLIES', 'TORK', '90-3439-244-RV', 0, 64.99, 110.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '90-3439-244-RV' OR UPPER(description) = 'WINDOW WEATHERSTRIP 15 FOOT STRIP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '91-00-6140', 'Equalizer 10K Ball', 'MISC/SHOP SUPPLIES', 'LIPPE', '91-00-6140', 0, 39.95, 55.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '91-00-6140' OR UPPER(description) = 'EQUALIZER 10K BALL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '926PI14.301UL', 'Dometic Awning Fabric With Led Lights 14'' Black Fa', 'MISC/SHOP SUPPLIES', 'TORK', '926PI14.301UL', 0, 579.13, 752.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '926PI14.301UL' OR UPPER(description) = 'DOMETIC AWNING FABRIC WITH LED LIGHTS 14'' BLACK FA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '94-02-0899', 'E2 Weight Distribution Bar - 800Lb', 'MISC/SHOP SUPPLIES', 'TORK', '94-02-0899', 0, 65.19, 103.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '94-02-0899' OR UPPER(description) = 'E2 WEIGHT DISTRIBUTION BAR - 800LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9605-01', 'Risestar Led Ceiling Lights', 'MISC/SHOP SUPPLIES', 'AMAZO', 'x0028bsevr', 0, 0.0, 77.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9605-01' OR UPPER(description) = 'RISESTAR LED CEILING LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '968969&021712FC', 'Panel 22.50 X 24.50', 'HARDWARE', 'RENOG', '968969&021712FC', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '968969&021712FC' OR UPPER(description) = 'PANEL 22.50 X 24.50');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '968969&023718FC', 'Pre Laminate .75X25.13X4.51', 'HARDWARE', 'RENOG', '968969&023718FC', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '968969&023718FC' OR UPPER(description) = 'PRE LAMINATE .75X25.13X4.51');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '968969-17', 'Cabinet Trim 22.50 X 24.50 Pnl', 'MISC/SHOP SUPPLIES', 'TORK', '968969-17', 0, 90.0, 130.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '968969-17' OR UPPER(description) = 'CABINET TRIM 22.50 X 24.50 PNL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '968969-23', 'Cabinet Trim', 'MISC/SHOP SUPPLIES', 'TORK', '968969-23', 0, 85.0, 119.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '968969-23' OR UPPER(description) = 'CABINET TRIM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '968969-22', 'Cabinet Tyrim', 'MISC/SHOP SUPPLIES', 'TORK', '968969-22', 0, 60.0, 84.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '968969-22' OR UPPER(description) = 'CABINET TYRIM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9A49', 'Non-Hazardous Battery', 'ELECTRICAL', 'TORK', '9A49', 0, 199.91, 299.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9A49' OR UPPER(description) = 'NON-HAZARDOUS BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '9-SG1-00146', 'Drivers Side Middle Window 60X22', 'MISC/SHOP SUPPLIES', 'CMP W', '9-SG1-00146', 0, 599.0, 778.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '9-SG1-00146' OR UPPER(description) = 'DRIVERS SIDE MIDDLE WINDOW 60X22');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A01-000102S0', 'Plastic Shower Head With Hose', 'MISC/SHOP SUPPLIES', 'AMAZO', 'A01-000102S0', 0, 15.99, 31.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A01-000102S0' OR UPPER(description) = 'PLASTIC SHOWER HEAD WITH HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'a01-0169LF', 'City Water Fill Inlet Connector', 'MISC/SHOP SUPPLIES', 'AMAZO', 'a01-0169LF', 0, 16.99, 25.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'a01-0169LF' OR UPPER(description) = 'CITY WATER FILL INLET CONNECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A01-0172LF', 'Valterra City Water Inlet', 'MISC/SHOP SUPPLIES', 'AMAZO', 'A01-0172LF', 0, 17.66, 35.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A01-0172LF' OR UPPER(description) = 'VALTERRA CITY WATER INLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A04-0448BK', 'Valterra A04-0448Bk Black Cap/Saddle For Adjustabl', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 17.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A04-0448BK' OR UPPER(description) = 'VALTERRA A04-0448BK BLACK CAP/SADDLE FOR ADJUSTABL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A-162', 'Short Forged Brass Nut', 'MISC/SHOP SUPPLIES', 'HDEPO', 'A-162', 0, 8.69, 17.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A-162' OR UPPER(description) = 'SHORT FORGED BRASS NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A4510', '18Inch Drawer Slide', 'MISC/SHOP SUPPLIES', 'DOM', 'A4510', 0, 20.9, 29.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A4510' OR UPPER(description) = '18INCH DRAWER SLIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A5200C', 'Battery Switch 12-48 V 600A Continuous Battery Pow', 'MISC/SHOP SUPPLIES', 'AMAZO', 'A5201CC', 0, 0.0, 55.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A5200C' OR UPPER(description) = 'BATTERY SWITCH 12-48 V 600A CONTINUOUS BATTERY POW');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A8023', 'Glowstep Adapter Bracket', 'MISC/SHOP SUPPLIES', 'TORK', 'A8023', 0, 74.15, 103.81, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A8023' OR UPPER(description) = 'GLOWSTEP ADAPTER BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A8072', 'Torklift Airstream 2 Step', 'DOORS/WINDOWS/AWNINGS', 'TORK', 'A8072', 0, 430.68, 602.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A8072' OR UPPER(description) = 'TORKLIFT AIRSTREAM 2 STEP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'A8073', 'Torklift Glowstep  Revolution 3-Step', 'DOORS/WINDOWS/AWNINGS', 'TORK', 'A8073', 0, 497.14, 696.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'A8073' OR UPPER(description) = 'TORKLIFT GLOWSTEP  REVOLUTION 3-STEP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AB-2', 'Pex B Tubing 2 Ft', 'MISC/SHOP SUPPLIES', 'ETRAI', 'AB-2', 0, 2.39, 5.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AB-2' OR UPPER(description) = 'PEX B TUBING 2 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ABF-406-300A', '300A Mega Fuse Bolt Mount', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 3, 0.0, 9.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ABF-406-300A' OR UPPER(description) = '300A MEGA FUSE BOLT MOUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ABS P TRAP', 'P-Trap Assembly', 'MISC/SHOP SUPPLIES', 'TORK', 'ABS P TRAP', 0, 115.88, 24.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ABS P TRAP' OR UPPER(description) = 'P-TRAP ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AC542', 'Faucet', 'MISC/SHOP SUPPLIES', 'DOMET', 'AC542', 0, 133.32, 186.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AC542' OR UPPER(description) = 'FAUCET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AF225', 'Prestone Original Rv/Marine Antifreeze', 'MISC/SHOP SUPPLIES', 'TORK', 'AF225', 0, 5.59, 11.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AF225' OR UPPER(description) = 'PRESTONE ORIGINAL RV/MARINE ANTIFREEZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AFSK', 'Airstream Front Separation Kit', 'MISC/SHOP SUPPLIES', '.....', 'AFSK', 1, 80.69, 161.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AFSK' OR UPPER(description) = 'AIRSTREAM FRONT SEPARATION KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ALLOYPRO', 'Large Flange Blind Rivets', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 29.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ALLOYPRO' OR UPPER(description) = 'LARGE FLANGE BLIND RIVETS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'Am-CBS04', 'Ampper High Current Battery Switch, 12-48 V Batter', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 64.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'Am-CBS04' OR UPPER(description) = 'AMPPER HIGH CURRENT BATTERY SWITCH, 12-48 V BATTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AMZ1X50INS', 'Vinyl Insert 1"X50'' White', 'HARDWARE', 'ETRAI', 'AMZ1X50INS', 0, 27.88, 55.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AMZ1X50INS' OR UPPER(description) = 'VINYL INSERT 1"X50'' WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ANL-250-10', '250 Amp Super Fuse Anl Model', 'MISC/SHOP SUPPLIES', 'TORK', 'ANL-250-10', 0, 8.99, 17.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ANL-250-10' OR UPPER(description) = '250 AMP SUPER FUSE ANL MODEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ANSI-61', 'Pex Fitting 1/2" Straight', 'MISC/SHOP SUPPLIES', 'TORK', 'ANSI-61', 0, 2.68, 3.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ANSI-61' OR UPPER(description) = 'PEX FITTING 1/2" STRAIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AP-12080-4', 'Electrical Juction Box 4"', 'MISC/SHOP SUPPLIES', 'TORK', 'AP-12080-4', 0, 4.49, 8.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AP-12080-4' OR UPPER(description) = 'ELECTRICAL JUCTION BOX 4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AP-GC2', '6 Volt Agm Rv Battery', 'MISC/SHOP SUPPLIES', 'AMAZO', 'AP-GC2', 0, 0.0, 313.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AP-GC2' OR UPPER(description) = '6 VOLT AGM RV BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ARCA6CC-25-OD-BK', 'Cat6 25'' Cable', 'MISC/SHOP SUPPLIES', 'TORK', 'ARCA6CC-25-OD-BK', 0, 11.89, 23.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ARCA6CC-25-OD-BK' OR UPPER(description) = 'CAT6 25'' CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASS030064950', 'Rj45 Utp Cable Victron Energy', 'MISC/SHOP SUPPLIES', 'TORK', 'ASS030064950', 0, 12.95, 19.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASS030064950' OR UPPER(description) = 'RJ45 UTP CABLE VICTRON ENERGY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASS030530203', 'Victron Energy Cable Dirct 2.95 Ft Right Angle Con', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 20.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASS030530203' OR UPPER(description) = 'VICTRON ENERGY CABLE DIRCT 2.95 FT RIGHT ANGLE CON');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASS030530203parent', 'Victron Energy Ve.Direct Cable, 2.95 Ft (One Side', 'MISC/SHOP SUPPLIES', 'AMAZO', 'ASS030531209', 0, 0.0, 20.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASS030530203parent' OR UPPER(description) = 'VICTRON ENERGY VE.DIRECT CABLE, 2.95 FT (ONE SIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASS030536011', 'Victron Smart Dongle (Bluetooth)', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 69.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASS030536011' OR UPPER(description) = 'VICTRON SMART DONGLE (BLUETOOTH)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASS050300010', 'Wall Mounted Enclosure For Control Panel', 'ELECTRICAL', '.....', 'ASS050300010', 0, 22.69, 45.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASS050300010' OR UPPER(description) = 'WALL MOUNTED ENCLOSURE FOR CONTROL PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASTM F1807', 'Shut Off Valve Barb Crimp', 'MISC/SHOP SUPPLIES', 'TORK', 'ASTM F1807', 7, 38.99, 58.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASTM F1807' OR UPPER(description) = 'SHUT OFF VALVE BARB CRIMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ASTM F1960', 'Efield 1/4 Turn Straight Stop Valve Pex 1/2 "', 'MISC/SHOP SUPPLIES', 'TORK', 'ASTM F1960', 0, 5.95, 8.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ASTM F1960' OR UPPER(description) = 'EFIELD 1/4 TURN STRAIGHT STOP VALVE PEX 1/2 "');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AT91059', 'Atwood At91059 Replacement Inner Water Heater Tank', 'MISC/SHOP SUPPLIES', 'AMAZO', 'AT91059', 0, 300.8, 2045.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AT91059' OR UPPER(description) = 'ATWOOD AT91059 REPLACEMENT INNER WATER HEATER TANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ATC20', '20 Amp Atc Automotive Fuse', 'MISC/SHOP SUPPLIES', 'TORK', 'ATC20', 0, 2.99, 8.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ATC20' OR UPPER(description) = '20 AMP ATC AUTOMOTIVE FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ATKKE 15"', '15 " Pigtail Hoses For Lp', 'MISC/SHOP SUPPLIES', '.....', 'ATKKE 15"', 0, 19.97, 39.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ATKKE 15"' OR UPPER(description) = '15 " PIGTAIL HOSES FOR LP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ATKKE15', 'Atkke15 Inch Lp Hose', 'MISC/SHOP SUPPLIES', '', 'ATKKE15', 0, 39.45, 78.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ATKKE15' OR UPPER(description) = 'ATKKE15 INCH LP HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'AUVECO 16237', '# 8 -32 Well Nut', 'MISC/SHOP SUPPLIES', 'TORK', 'AUVECO 16237', 0, 19.71, 39.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'AUVECO 16237' OR UPPER(description) = '# 8 -32 WELL NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B00061X85A', 'Camco Fresh Tank Drain Valve', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B00061X85A', 0, 3.97, 5.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B00061X85A' OR UPPER(description) = 'CAMCO FRESH TANK DRAIN VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B003QTD6V2', '1 Gallon 3M Contact Cement', 'MISC/SHOP SUPPLIES', 'TORK', 'B003QTD6V2', 0, 139.54, 195.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B003QTD6V2' OR UPPER(description) = '1 GALLON 3M CONTACT CEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B003YPJRCU', 'Cloroplast Black  24X 60"', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B003YPJRCU', 0, 24.34, 36.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B003YPJRCU' OR UPPER(description) = 'CLOROPLAST BLACK  24X 60"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B00JFUJENO', 'Lp Mounting Bracket For Regulator', 'MISC/SHOP SUPPLIES', '.....', 'B00JFUJENO', 0, 12.28, 24.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B00JFUJENO' OR UPPER(description) = 'LP MOUNTING BRACKET FOR REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B00YG2BZM0', 'Renogy 15 A Inline Solar Panel Fuse', 'MISC/SHOP SUPPLIES', 'ETRAI', 'B00YG2BZM0', 0, 15.12, 22.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B00YG2BZM0' OR UPPER(description) = 'RENOGY 15 A INLINE SOLAR PANEL FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B019X205CY', 'Solar Charge Controller', 'MISC/SHOP SUPPLIES', 'TORK', 'B019X205CY', 0, 230.0, 349.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B019X205CY' OR UPPER(description) = 'SOLAR CHARGE CONTROLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B01GGNL90O', 'Classacoustoms Jack', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B01GGNL90O', 0, 64.21, 89.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B01GGNL90O' OR UPPER(description) = 'CLASSACOUSTOMS JACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B01MXRVKLB', '20Ft 10'' Black 10'' Red 1/0 Gauge Premium Welding W', 'ELECTRICAL', 'AMAZO', 'B01MXRVKLB', 0, 0.0, 216.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B01MXRVKLB' OR UPPER(description) = '20FT 10'' BLACK 10'' RED 1/0 GAUGE PREMIUM WELDING W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B06VAK', 'Ecobatt Insulation', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B06VAK', 0, 148.07, 192.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B06VAK' OR UPPER(description) = 'ECOBATT INSULATION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B075DG55KS', 'Lemotech Abs Plastic Juction Box', 'MISC/SHOP SUPPLIES', 'TORK', 'B075DG55KS', 0, 9.98, 14.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B075DG55KS' OR UPPER(description) = 'LEMOTECH ABS PLASTIC JUCTION BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B076MQM9DC', 'Victron Multi Plus 200/200A Inverter Controller', 'MISC/SHOP SUPPLIES', 'TORK', 'B076MQM9DC', 0, 139.9, 195.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B076MQM9DC' OR UPPER(description) = 'VICTRON MULTI PLUS 200/200A INVERTER CONTROLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B07BMHPS97', '10 Pieces Xfitting 1/2" Pex X 1/2" Female Npt Thre', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 29.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B07BMHPS97' OR UPPER(description) = '10 PIECES XFITTING 1/2" PEX X 1/2" FEMALE NPT THRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B07G8PN6ST', '7 Way Trailer Plug Cord 12 Ft 10-14Awg', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B07G8PN6ST', 0, 36.75, 58.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B07G8PN6ST' OR UPPER(description) = '7 WAY TRAILER PLUG CORD 12 FT 10-14AWG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B07TTNF118', '12-24 V 15 Amp 12V. Outlet', 'MISC/SHOP SUPPLIES', '.....', 'B07TTNF118', 0, 14.97, 29.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B07TTNF118' OR UPPER(description) = '12-24 V 15 AMP 12V. OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B07WWCDVLL', 'Exhaust Fan 14" Complete', 'MISC/SHOP SUPPLIES', 'DOM', 'B07WWCDVLL', 0, 64.28, 89.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B07WWCDVLL' OR UPPER(description) = 'EXHAUST FAN 14" COMPLETE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B07X33GZSZ', 'Xhf 2 Pcs 1/2 Inch (13Mm) 3:1 Waterproof Polyolefi', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 10.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B07X33GZSZ' OR UPPER(description) = 'XHF 2 PCS 1/2 INCH (13MM) 3:1 WATERPROOF POLYOLEFI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B081XPSGVM', 'Sungator (25-Pack) 1/2 Inch Tee Pex Brass Crimp Fi', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 45.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B081XPSGVM' OR UPPER(description) = 'SUNGATOR (25-PACK) 1/2 INCH TEE PEX BRASS CRIMP FI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B084D3327L', 'Business Prime Membership Fee', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 96.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B084D3327L' OR UPPER(description) = 'BUSINESS PRIME MEMBERSHIP FEE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B08TQNB85H', '10 Pack Grabber Catch 10Lbs Rv Drawer Latch (Owach', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 27.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B08TQNB85H' OR UPPER(description) = '10 PACK GRABBER CATCH 10LBS RV DRAWER LATCH (OWACH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B091DRT5DN', 'Handheld Carbon Monoxide Meter, Portable Co Gas De', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 55.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B091DRT5DN' OR UPPER(description) = 'HANDHELD CARBON MONOXIDE METER, PORTABLE CO GAS DE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B092VPGJB9', 'Amazon Basics Flextra Tall Kitchen Drawstring Tras', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 22.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B092VPGJB9' OR UPPER(description) = 'AMAZON BASICS FLEXTRA TALL KITCHEN DRAWSTRING TRAS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B096G16Y6Q', 'Lp Pigtail Hose', 'MISC/SHOP SUPPLIES', 'TORK', 'B096G16Y6Q', 0, 7.0, 11.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B096G16Y6Q' OR UPPER(description) = 'LP PIGTAIL HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09BN16DJC', 'Solar Extension 10 Ft. Mc4 Adapter', 'MISC/SHOP SUPPLIES', 'AMAZO', 'B09BN16DJC', 0, 36.78, 51.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09BN16DJC' OR UPPER(description) = 'SOLAR EXTENSION 10 FT. MC4 ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09BYVGMB7', 'Pex Pipe 1/2" X Ft', 'MISC/SHOP SUPPLIES', 'TORK', 'B09BYVGMB7', 0, 3.0, 4.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09BYVGMB7' OR UPPER(description) = 'PEX PIPE 1/2" X FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09G2STXGQ', '(Pack Of 5) Efield Pex-B 1/2" Pex X 1/2" Female Np', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 29.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09G2STXGQ' OR UPPER(description) = '(PACK OF 5) EFIELD PEX-B 1/2" PEX X 1/2" FEMALE NP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09KV44NX8', '20 Pieces Rv Drawer Latch And Catches 10 Lb Pull F', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 43.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09KV44NX8' OR UPPER(description) = '20 PIECES RV DRAWER LATCH AND CATCHES 10 LB PULL F');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09MTBCD1K', 'Reading Glasses Readers For Men Blue Light Blockin', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 24.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09MTBCD1K' OR UPPER(description) = 'READING GLASSES READERS FOR MEN BLUE LIGHT BLOCKIN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09NT6NLGX', '(Pack Of 10) Efield 1/4 Turn Straight Stop Valve B', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 65.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09NT6NLGX' OR UPPER(description) = '(PACK OF 10) EFIELD 1/4 TURN STRAIGHT STOP VALVE B');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09SKZTW85', 'Rotating Sewer Vent, Rotating Sewer Plumbing Vent', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 32.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09SKZTW85' OR UPPER(description) = 'ROTATING SEWER VENT, ROTATING SEWER PLUMBING VENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09YMFX6MP', '7Way Plug Inlet Cord', 'MISC/SHOP SUPPLIES', 'TORK', 'B09YMFX6MP', 0, 26.99, 53.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09YMFX6MP' OR UPPER(description) = '7WAY PLUG INLET CORD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B09ZKQ7PV7', 'Blue Light Blocking Reading Glasses,Anti Glare/Hea', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 25.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B09ZKQ7PV7' OR UPPER(description) = 'BLUE LIGHT BLOCKING READING GLASSES,ANTI GLARE/HEA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B0B5KS21Z3', 'Adapter Cord 30 Amp To 110', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 2, 0.0, 27.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B0B5KS21Z3' OR UPPER(description) = 'ADAPTER CORD 30 AMP TO 110');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B0B98DTKCV', 'Blink 5X Premium Butane 300Ml - 3 Pack', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 16.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B0B98DTKCV' OR UPPER(description) = 'BLINK 5X PREMIUM BUTANE 300ML - 3 PACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B0BK8D3C2K', 'Bus Bar Power Distribution M6 1/4" X 6 12V', 'ELECTRICAL', 'AMAZO', 'B0BK8D3C2K', 0, 19.99, 39.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B0BK8D3C2K' OR UPPER(description) = 'BUS BAR POWER DISTRIBUTION M6 1/4" X 6 12V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B3314989NS.415', 'Sandstone To White Dometic Awning Fabric 15Ft', 'MISC/SHOP SUPPLIES', 'DOM', 'B3314989NS.415', 0, 0.0, 299.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B3314989NS.415' OR UPPER(description) = 'SANDSTONE TO WHITE DOMETIC AWNING FABRIC 15FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'B4-16', '100Pcs1/8" X1/2" Aluminum Blind Rivets, Black, 3.2', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 11.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'B4-16' OR UPPER(description) = '100PCS1/8" X1/2" ALUMINUM BLIND RIVETS, BLACK, 3.2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BAC00441100', 'Propane Hose - 7 Ft', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 43.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BAC00441100' OR UPPER(description) = 'PROPANE HOSE - 7 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BB100112H', 'Battle Born Lithium Battery', 'MISC/SHOP SUPPLIES', 'LIPPE', 'BB100112H', 0, 0.0, 1134.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BB100112H' OR UPPER(description) = 'BATTLE BORN LITHIUM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BB10012H', 'Battleborn Batteries With Heat Kit', 'MISC/SHOP SUPPLIES', 'DRAGO', '', 0, 810.0, 1134.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BB10012H' OR UPPER(description) = 'BATTLEBORN BATTERIES WITH HEAT KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BB10012H-1KIT', '100 Amp Battle Born 12V Lifepo4 Heated Battery Kit', 'MISC/SHOP SUPPLIES', 'DRAGO', 'BB10012H-1KIT', 0, 810.0, 1134.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BB10012H-1KIT' OR UPPER(description) = '100 AMP BATTLE BORN 12V LIFEPO4 HEATED BATTERY KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BCP461', '1000 Qty Aluminum Blind Rivets Bulk (#4-4) 1/8" Di', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 39.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BCP461' OR UPPER(description) = '1000 QTY ALUMINUM BLIND RIVETS BULK (#4-4) 1/8" DI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BG5DEK', 'Deka Agm Non-Hazardous, Non-Spillable Batteries', 'MISC/SHOP SUPPLIES', 'TORK', 'BG5DEK', 0, 250.5, 350.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BG5DEK' OR UPPER(description) = 'DEKA AGM NON-HAZARDOUS, NON-SPILLABLE BATTERIES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BGAUTOBLACK', 'Windshield Adhesive', 'MISC/SHOP SUPPLIES', 'ETRAI', 'BGAUTOBLACK', 0, 16.45, 32.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BGAUTOBLACK' OR UPPER(description) = 'WINDSHIELD ADHESIVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BM22GR', 'City/Tank Fill', 'PLUMBING', '.....', 'BM22GR', 0, 83.59, 125.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BM22GR' OR UPPER(description) = 'CITY/TANK FILL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BME00010100', '15 Inch  Qcc1/Type1 Connector With Hose', 'MISC/SHOP SUPPLIES', '.....', 'BME00010100', 0, 18.8, 37.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BME00010100' OR UPPER(description) = '15 INCH  QCC1/TYPE1 CONNECTOR WITH HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BME300', 'Victron Super Fuse Holder', 'MISC/SHOP SUPPLIES', 'TORK', 'BME300', 0, 10.71, 21.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BME300' OR UPPER(description) = 'VICTRON SUPER FUSE HOLDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BO81XLBJN1', 'Pex Elbow 1/2"', 'MISC/SHOP SUPPLIES', 'TORK', 'BO81XLBJN1', 0, 0.0, 3.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BO81XLBJN1' OR UPPER(description) = 'PEX ELBOW 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BOB5R4R92W_CA NARF', 'Battery Cut Off Switch M Series', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 2, 0.0, 51.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BOB5R4R92W_CA NARF' OR UPPER(description) = 'BATTERY CUT OFF SWITCH M SERIES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BOBKCB1MF8', 'Pex  Line 1/2"', 'MISC/SHOP SUPPLIES', 'TORK', 'BOBKCB1MF8', 0, 0.0, 2.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BOBKCB1MF8' OR UPPER(description) = 'PEX  LINE 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BODYG2BZMO', '15A Male Connector Waterproof Fan', 'MISC/SHOP SUPPLIES', 'TORK', 'BODYG2BZMO', 0, 14.89, 29.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BODYG2BZMO' OR UPPER(description) = '15A MALE CONNECTOR WATERPROOF FAN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BOJACK300', '300 Amp Super Fise', 'ELECTRICAL', '.....', 'BOJACK300', 0, 11.39, 22.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BOJACK300' OR UPPER(description) = '300 AMP SUPER FISE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BOZXYE', 'Cabinet Locks 5/8"', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 6, 0.0, 11.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BOZXYE' OR UPPER(description) = 'CABINET LOCKS 5/8"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BP/ATC-30-RP', '30 Amp Atc Fuse', 'MISC/SHOP SUPPLIES', 'TORK', 'BP/ATC-30-RP', 0, 2.99, 2.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BP/ATC-30-RP' OR UPPER(description) = '30 AMP ATC FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BREAK A WAY', 'X003Ay23Ft', 'ELECTRICAL', 'RICH', 'BREAK A WAY', 0, 14.24, 28.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BREAK A WAY' OR UPPER(description) = 'X003AY23FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BVD0218-00', 'Vent Fan Motor', 'MISC/SHOP SUPPLIES', 'AMAZO', 'BVD0218-00', 0, 24.45, 48.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BVD0218-00' OR UPPER(description) = 'VENT FAN MOTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BVD0449A01', 'White Vent Lid Ventline', 'MISC/SHOP SUPPLIES', 'TORK', 'BVD0449A01', 0, 19.83, 39.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BVD0449A01' OR UPPER(description) = 'WHITE VENT LID VENTLINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BVD0449-A03', 'Smoked Vent Lid Ventline', 'MISC/SHOP SUPPLIES', 'TORK', 'BVD0449-A03', 0, 0.0, 61.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BVD0449-A03' OR UPPER(description) = 'SMOKED VENT LID VENTLINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'BXSZ-4', '10 Gauge Fuse Holder - 10 Awg Inline Fuse Holder W', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 13.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'BXSZ-4' OR UPPER(description) = '10 GAUGE FUSE HOLDER - 10 AWG INLINE FUSE HOLDER W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'C5807LT', '1/2" 90 Long Turn Elbow Abs', 'PLUMBING', 'AMAZO', 'C5807LT', 0, 5.53, 7.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'C5807LT' OR UPPER(description) = '1/2" 90 LONG TURN ELBOW ABS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'C7W48204069', 'Coleman Mach 15 Ac 15,000Btu', 'MISC/SHOP SUPPLIES', 'TORK', 'C7W48204069', 0, 0.0, 1063.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'C7W48204069' OR UPPER(description) = 'COLEMAN MACH 15 AC 15,000BTU');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CAC-E95X30-K', 'Class A Customs | Rv Camper Rubber Roofing 9.5'' Wi', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 601.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CAC-E95X30-K' OR UPPER(description) = 'CLASS A CUSTOMS | RV CAMPER RUBBER ROOFING 9.5'' WI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CB185-150', 'Bussmann Cb185-150 150 Amp Type Iii Circuit Breake', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 2, 0.0, 55.41, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CB185-150' OR UPPER(description) = 'BUSSMANN CB185-150 150 AMP TYPE III CIRCUIT BREAKE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CB285-100', '100Amp Surface Mount Circuit Breaker', 'MISC/SHOP SUPPLIES', 'TORK', 'CB285-100', 0, 39.99, 79.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CB285-100' OR UPPER(description) = '100AMP SURFACE MOUNT CIRCUIT BREAKER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CB285-135', 'Bussmann Cb285-135 Surface-Mount Circuit Breakers,', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 45.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CB285-135' OR UPPER(description) = 'BUSSMANN CB285-135 SURFACE-MOUNT CIRCUIT BREAKERS,');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CBD610', 'Solar Cable Extension Wire 10 Feet', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 41.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CBD610' OR UPPER(description) = 'SOLAR CABLE EXTENSION WIRE 10 FEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CBUE-COMBI', 'Truma Hot Water Heater', 'MISC/SHOP SUPPLIES', 'TORK', 'CBUE-COMBI', 0, 2250.0, 2925.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CBUE-COMBI' OR UPPER(description) = 'TRUMA HOT WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CE-1000', 'Winegard Single Cable Entry Plate', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 4, 0.0, 9.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CE-1000' OR UPPER(description) = 'WINEGARD SINGLE CABLE ENTRY PLATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CE-2000', 'Winegard Company Ce-2000 Cable Entry Plate Dual', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 6.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CE-2000' OR UPPER(description) = 'WINEGARD COMPANY CE-2000 CABLE ENTRY PLATE DUAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CF-app', 'Adam''S Suede Applicator (2 Pack) - Car Detailing S', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 9.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CF-app' OR UPPER(description) = 'ADAM''S SUEDE APPLICATOR (2 PACK) - CAR DETAILING S');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CFLUG-2/0AG-38-10pcs', 'Wni 2/0 Gauge X 3/8 Pure Copper Battery Wel', 'ELECTRICAL', 'AMAZN', 'CFLUG-2/0AG-38-10pcs', 0, 16.88, 23.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CFLUG-2/0AG-38-10pcs' OR UPPER(description) = 'WNI 2/0 GAUGE X 3/8 PURE COPPER BATTERY WEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CIP0001000', 'Victron Energy Mega Fuse Holder', 'MISC/SHOP SUPPLIES', 'NTP', '', 3, 0.0, 18.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CIP0001000' OR UPPER(description) = 'VICTRON ENERGY MEGA FUSE HOLDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CIP136400010', 'Victron Mega-Fuse (400A/12V & 24V)', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 33.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CIP136400010' OR UPPER(description) = 'VICTRON MEGA-FUSE (400A/12V & 24V)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CK-Frienda-16912', 'Rv Underbelly Material 50 Feet Rv Underbelly Tape', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 34.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CK-Frienda-16912' OR UPPER(description) = 'RV UNDERBELLY MATERIAL 50 FEET RV UNDERBELLY TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CL-003', 'Compartment Door Locks', 'MISC/SHOP SUPPLIES', 'TORK', 'CL-003', 0, 3.59, 7.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CL-003' OR UPPER(description) = 'COMPARTMENT DOOR LOCKS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CMP122200100', 'Victron 2000Watt Inverter', 'MISC/SHOP SUPPLIES', 'AMAZO', 'CMP122200100', 0, 1470.0, 1470.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CMP122200100' OR UPPER(description) = 'VICTRON 2000WATT INVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CO14-12-SS', 'Stainless Lp 12" Pigtail Hoses', 'MISC/SHOP SUPPLIES', 'AMAZO', 'CO14-12-SS', 0, 19.99, 39.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CO14-12-SS' OR UPPER(description) = 'STAINLESS LP 12" PIGTAIL HOSES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CORE', 'Charged For: Interstate Group 24 Deep Cycle Batter', 'MISC/SHOP SUPPLIES', 'INTER', 'CORE', 0, 8.0, 8.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CORE' OR UPPER(description) = 'CHARGED FOR: INTERSTATE GROUP 24 DEEP CYCLE BATTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CP-0065', 'Awblin Battery Disconnect Switch 12V/24V/48V', 'MISC/SHOP SUPPLIES', 'TORK', 'CP-0065', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CP-0065' OR UPPER(description) = 'AWBLIN BATTERY DISCONNECT SWITCH 12V/24V/48V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CRVSFAG1422', 'Sct Rv Skilight Inner Dome With Clear -14" X 22', 'DOORS/WINDOWS/AWNINGS', 'AMAZO', 'CRVSFAG1422', 0, 59.99, 89.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CRVSFAG1422' OR UPPER(description) = 'SCT RV SKILIGHT INNER DOME WITH CLEAR -14" X 22');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'CYEAH', '4" C Clamp', 'HARDWARE', 'TORK', 'CYEAH', 0, 23.88, 47.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'CYEAH' OR UPPER(description) = '4" C CLAMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DC-24', 'Deka Agm Battery', 'MISC/SHOP SUPPLIES', 'TORK', 'DC-24', 0, 113.77, 229.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DC-24' OR UPPER(description) = 'DEKA AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DD0298', 'Grabber Catches', 'MISC/SHOP SUPPLIES', 'AMAZO', 'DD0298', 10, 1.55, 5.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DD0298' OR UPPER(description) = 'GRABBER CATCHES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DHM-01', '18Pcs L Bracket Corner Bracket', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 12.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DHM-01' OR UPPER(description) = '18PCS L BRACKET CORNER BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DJ60', 'Warsun Led Work Light Rechargeable Work Light Port', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 69.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DJ60' OR UPPER(description) = 'WARSUN LED WORK LIGHT RECHARGEABLE WORK LIGHT PORT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DM2672RB-1', '6 Cubic Foot Dometic Refrigerator', 'MISC/SHOP SUPPLIES', 'TORK', 'DM2672RB-1', 0, 1719.29, 2240.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DM2672RB-1' OR UPPER(description) = '6 CUBIC FOOT DOMETIC REFRIGERATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DMC000200010R', '200/200 Amp Digital Multi Panel Victron87190760170', 'MISC/SHOP SUPPLIES', 'TORK', 'DMC000200010R', 0, 137.7, 192.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DMC000200010R' OR UPPER(description) = '200/200 AMP DIGITAL MULTI PANEL VICTRON87190760170');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DMC77RR', 'Soft Start For Penguin Ii', 'MISC/SHOP SUPPLIES', '.....', 'DMC77RR', 1, 247.28, 370.92, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DMC77RR' OR UPPER(description) = 'SOFT START FOR PENGUIN II');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DMC97FR', 'Fridge Roof Vent Cap & Base - Black', 'MISC/SHOP SUPPLIES', 'TORK', 'DMC97FR', 0, 0.0, 45.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DMC97FR' OR UPPER(description) = 'FRIDGE ROOF VENT CAP & BASE - BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DMSE-F0232-Colorado', 'Dmse Colorado Civil And State Flag 2X3 Ft Foot 100', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 11.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DMSE-F0232-Colorado' OR UPPER(description) = 'DMSE COLORADO CIVIL AND STATE FLAG 2X3 FT FOOT 100');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DPL TR250', 'Truck Bed Coating Paint', 'MISC/SHOP SUPPLIES', 'RAM', 'DPL TR250', 0, 17.29, 28.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DPL TR250' OR UPPER(description) = 'TRUCK BED COATING PAINT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'DVH-1-A', 'Hot Water Heater Bypass Valve', 'MISC/SHOP SUPPLIES', 'AMAZO', 'DVH-1-A', 0, 61.15, 85.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'DVH-1-A' OR UPPER(description) = 'HOT WATER HEATER BYPASS VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'E5257', 'Rv Side Latches', 'MISC/SHOP SUPPLIES', 'TORK', 'E5257', 0, 4.84, 9.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'E5257' OR UPPER(description) = 'RV SIDE LATCHES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'Eaton Bussmann', 'Bussmann Fuse Holder/Bussbar', 'MISC/SHOP SUPPLIES', '.....', 'Eaton Bussmann', 0, 14.15, 21.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'Eaton Bussmann' OR UPPER(description) = 'BUSSMANN FUSE HOLDER/BUSSBAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EB-RW020-5OR', 'Eternabond 2" White', 'MISC/SHOP SUPPLIES', 'AMAZO', 'EB-RW020-5OR', 0, 45.49, 90.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EB-RW020-5OR' OR UPPER(description) = 'ETERNABOND 2" WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EB-RW040', '4'''' Eternabond Roof Seal', 'MISC/SHOP SUPPLIES', 'AMAZO', 'EB-RW040', 0, 1.4, 2.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EB-RW040' OR UPPER(description) = '4'''' ETERNABOND ROOF SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ENG-VT-00029', 'Victron Inverter Controller Multiplus', 'MISC/SHOP SUPPLIES', 'LIPPE', 'ENG-VT-00029', 0, 137.7, 192.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ENG-VT-00029' OR UPPER(description) = 'VICTRON INVERTER CONTROLLER MULTIPLUS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ENG-VT-00033', 'Victron Interface Mk3-Usb (Ve.Bus To Usb)', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 101.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ENG-VT-00033' OR UPPER(description) = 'VICTRON INTERFACE MK3-USB (VE.BUS TO USB)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EP-201S15-BLK', 'Dpdt-Mom On/Off Blk', 'MISC/SHOP SUPPLIES', 'TORK', 'EP-201S15-BLK', 0, 11.99, 23.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EP-201S15-BLK' OR UPPER(description) = 'DPDT-MOM ON/OFF BLK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ER-068', 'Erayco 150 Amp Circuit Breaker With Manual Reset F', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 27.15, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ER-068' OR UPPER(description) = 'ERAYCO 150 AMP CIRCUIT BREAKER WITH MANUAL RESET F');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EWCS1/0AWGWCBLK-RED-25', 'Ewcs 1/0 Gauge Premium Extra Flexible Welding Cabl', 'MISC/SHOP SUPPLIES', 'AMAZO', 'EWCS1/0AWGWCBLK-RED-25', 0, 0.0, 361.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EWCS1/0AWGWCBLK-RED-25' OR UPPER(description) = 'EWCS 1/0 GAUGE PREMIUM EXTRA FLEXIBLE WELDING CABL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EWCS2/0AWGWCBLK-RED-15', 'Ewcs 2/0 Gauge Premium Extra Flexible Welding Cabl', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 250.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EWCS2/0AWGWCBLK-RED-15' OR UPPER(description) = 'EWCS 2/0 GAUGE PREMIUM EXTRA FLEXIBLE WELDING CABL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EWCSSPEC', '1 Ott Welding Wire Black & White 20'' And 20 Ft 10G', 'MISC/SHOP SUPPLIES', 'AMAZO', 'EWCSSPEC', 0, 258.4, 361.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EWCSSPEC' OR UPPER(description) = '1 OTT WELDING WIRE BLACK & WHITE 20'' AND 20 FT 10G');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EXCELFU', 'Rv Shower Faucet W Dual Smoked Knobs', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 2, 0.0, 37.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EXCELFU' OR UPPER(description) = 'RV SHOWER FAUCET W DUAL SMOKED KNOBS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'EXT15', 'Solar Panel Extension Connector 15 Ft', 'MISC/SHOP SUPPLIES', 'ETRAI', 'EXT15', 0, 39.99, 49.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'EXT15' OR UPPER(description) = 'SOLAR PANEL EXTENSION CONNECTOR 15 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'f100060949', 'Black Left Mount Step Ladder', 'DOORS/WINDOWS/AWNINGS', '.....', 'f100060949', 0, 248.81, 348.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'f100060949' OR UPPER(description) = 'BLACK LEFT MOUNT STEP LADDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100102100', 'Fascia #M41115,3/8" X 85" 50G, Cpii, Mdf Sides Cop', 'MISC/SHOP SUPPLIES', 'ETRAI', 'F100102100', 0, 17.2, 30.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100102100' OR UPPER(description) = 'FASCIA #M41115,3/8" X 85" 50G, CPII, MDF SIDES COP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330888', 'No-Bo Large Legend #1', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330888', 0, 26.76, 40.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330888' OR UPPER(description) = 'NO-BO LARGE LEGEND #1');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330905', 'No-Bo Front Decal #27', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330905', 0, 18.18, 23.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330905' OR UPPER(description) = 'NO-BO FRONT DECAL #27');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330909', 'No-Bo Front Mountain #7 Decal', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330909', 0, 13.6, 17.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330909' OR UPPER(description) = 'NO-BO FRONT MOUNTAIN #7 DECAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330920', 'Nobo Ods Front #27', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330920', 0, 1.84, 3.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330920' OR UPPER(description) = 'NOBO ODS FRONT #27');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330921', 'No-Bo Ds Front #27', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330921', 0, 1.84, 3.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330921' OR UPPER(description) = 'NO-BO DS FRONT #27');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F100330924', '#31 No-Bo Words Decal', 'MISC/SHOP SUPPLIES', 'TORK', 'F100330924', 0, 6.8, 10.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F100330924' OR UPPER(description) = '#31 NO-BO WORDS DECAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F2-ODU1-NL8H', '1 Inch Black Vinal Insert Molding', 'MISC/SHOP SUPPLIES', '.....', 'F2-ODU1-NL8H', 0, 19.3, 38.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F2-ODU1-NL8H' OR UPPER(description) = '1 INCH BLACK VINAL INSERT MOLDING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F52INS-BS-AM', '50 Mp Female Plug Recepticle', 'MISC/SHOP SUPPLIES', 'AMAZO', 'F52INS-BS-AM', 0, 75.71, 105.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F52INS-BS-AM' OR UPPER(description) = '50 MP FEMALE PLUG RECEPTICLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'F52INS-GS-AM', 'Furrion 50 Amp 125/250 Volt Shore Power Inlet With', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 95.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'F52INS-GS-AM' OR UPPER(description) = 'FURRION 50 AMP 125/250 VOLT SHORE POWER INLET WITH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FACR15HESA-BL', 'Furrion Roof Ac  (Lippert)', 'MISC/SHOP SUPPLIES', 'LIP', 'FACR15HESA-BL', 0, 786.17, 1039.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FACR15HESA-BL' OR UPPER(description) = 'FURRION ROOF AC  (LIPPERT)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FJX3473MBKAS', 'Dometic Ac 13,500 Btu Rooftop', 'MISC/SHOP SUPPLIES', 'NTP', 'FJX3473MBKAS', 0, 0.0, 1075.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FJX3473MBKAS' OR UPPER(description) = 'DOMETIC AC 13,500 BTU ROOFTOP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FJX3573MBKAS', 'Dometic Ac 15,000 Btu Rooftop', 'MISC/SHOP SUPPLIES', 'NTP', 'FJX3573MBKAS', 0, 0.0, 1271.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FJX3573MBKAS' OR UPPER(description) = 'DOMETIC AC 15,000 BTU ROOFTOP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FLARE008', 'Connector Male Flare Gas Adapter Metal Brass Fitti', 'MISC/SHOP SUPPLIES', 'TORK', 'FLARE008', 0, 9.88, 14.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FLARE008' OR UPPER(description) = 'CONNECTOR MALE FLARE GAS ADAPTER METAL BRASS FITTI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FLQ-1', 'Breakaway Switch, 6Ft Breakaway Coil', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 21.41, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FLQ-1' OR UPPER(description) = 'BREAKAWAY SWITCH, 6FT BREAKAWAY COIL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FM4814KIT', 'Belly Bottom Repair Kit-F', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 45.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FM4814KIT' OR UPPER(description) = 'BELLY BOTTOM REPAIR KIT-F');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FMBBXX', 'Underbelly Flex Mend', 'MISC/SHOP SUPPLIES', 'AMAZO', 'FMBBXX', 0, 49.99, 74.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FMBBXX' OR UPPER(description) = 'UNDERBELLY FLEX MEND');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FMIGNITE', 'Igniter Module 4 Position', 'MISC/SHOP SUPPLIES', 'ETRAI', 'FMIGNITE', 0, 56.67, 96.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FMIGNITE' OR UPPER(description) = 'IGNITER MODULE 4 POSITION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FOS07TASF', 'Furrion Vision 7''', 'MISC/SHOP SUPPLIES', 'TORK', 'FOS07TASF', 0, 563.05, 731.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FOS07TASF' OR UPPER(description) = 'FURRION VISION 7''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FR34 140765', 'Mcd Blinds', 'MISC/SHOP SUPPLIES', 'CAMCO', 'FR34 140765', 0, 105.0, 157.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FR34 140765' OR UPPER(description) = 'MCD BLINDS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FR34PR', 'Black Furrion Ac Shroud', 'MISC/SHOP SUPPLIES', 'ETRAI', 'FR34PR', 0, 193.19, 270.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FR34PR' OR UPPER(description) = 'BLACK FURRION AC SHROUD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FREIGHT', 'Freight For Solar', 'MISC/SHOP SUPPLIES', 'TORK', 'FREIGHT', 0, 0.0, 30.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FREIGHT' OR UPPER(description) = 'FREIGHT FOR SOLAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FRLF', 'Aluminum & Seam Tape Disposal', 'MISC/SHOP SUPPLIES', 'RICH', 'FRLF', 0, 175.0, 227.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FRLF' OR UPPER(description) = 'ALUMINUM & SEAM TAPE DISPOSAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'FWZ10318', 'Zip Breakaway Cable', 'MISC/SHOP SUPPLIES', 'AMAZO', 'FWZ10318', 0, 16.5, 23.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'FWZ10318' OR UPPER(description) = 'ZIP BREAKAWAY CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'G106C', 'Changeover Regulator', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 96.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'G106C' OR UPPER(description) = 'CHANGEOVER REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'G21', '3Tk  20" Gas Strut', 'MISC/SHOP SUPPLIES', 'TORK', 'G21', 0, 33.39, 53.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'G21' OR UPPER(description) = '3TK  20" GAS STRUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GA08-2', '12" Lp Pigtail Set Of 2', 'MISC/SHOP SUPPLIES', 'TORK', 'GA08-2', 0, 15.67, 31.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GA08-2' OR UPPER(description) = '12" LP PIGTAIL SET OF 2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GC2-ECL-UTL', '6 Volt  Interstate Battery', 'MISC/SHOP SUPPLIES', 'TORK', 'GC2-ECL-UTL', 0, 160.95, 241.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GC2-ECL-UTL' OR UPPER(description) = '6 VOLT  INTERSTATE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GCH043', 'Lp Propane Hoses', 'MISC/SHOP SUPPLIES', '.....', 'GCH043', 0, 19.99, 33.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GCH043' OR UPPER(description) = 'LP PROPANE HOSES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GCL-ECL-UTL', '6 Volt Battery Deep Cycle', 'MISC/SHOP SUPPLIES', 'TORK', 'GCL-ECL-UTL', 0, 160.95, 225.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GCL-ECL-UTL' OR UPPER(description) = '6 VOLT BATTERY DEEP CYCLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GDS', 'Adam''S Graphene Detail Spray (16 Oz) - Extend Prot', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 19.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GDS' OR UPPER(description) = 'ADAM''S GRAPHENE DETAIL SPRAY (16 OZ) - EXTEND PROT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GO13', '7 Way Trailer Plug 8 Feet', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 35.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GO13' OR UPPER(description) = '7 WAY TRAILER PLUG 8 FEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GP27MR', 'Go Power 100 Watt Expansion Kit', 'MISC/SHOP SUPPLIES', 'TORK', 'GP27MR', 0, 188.03, 263.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GP27MR' OR UPPER(description) = 'GO POWER 100 WATT EXPANSION KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GP39MR', 'Go Power 400W Solar Panel & Charging System', 'MISC/SHOP SUPPLIES', 'TORK', 'GP39MR', 0, 710.38, 994.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GP39MR' OR UPPER(description) = 'GO POWER 400W SOLAR PANEL & CHARGING SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GPL-24T', 'Lifeline Group 24 Battery', 'MISC/SHOP SUPPLIES', 'TLR W', 'GPL-24T', 0, 200.0, 280.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GPL-24T' OR UPPER(description) = 'LIFELINE GROUP 24 BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GPNB46100-BX', 'Ammex Gloveworks Industrial Black Nitrile Gloves,', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 23.41, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GPNB46100-BX' OR UPPER(description) = 'AMMEX GLOVEWORKS INDUSTRIAL BLACK NITRILE GLOVES,');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GP-PWM-30-UL', '30 Amp Pulse Wave 30 Amp Charge Contrller', 'SOLAR', 'TORK', 'GP-PWM-30-UL', 0, 79.59, 159.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GP-PWM-30-UL' OR UPPER(description) = '30 AMP PULSE WAVE 30 AMP CHARGE CONTRLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GP-RV-95E', 'Go Power Solar Panel', 'MISC/SHOP SUPPLIES', 'AMAZO', 'GP-RV-95E', 0, 315.5, 473.25, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GP-RV-95E' OR UPPER(description) = 'GO POWER SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GS-2125DL', '4000 Lb  Wheel Seal', 'MISC/SHOP SUPPLIES', '.....', 'GS-2125DL', 0, 2.89, 8.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GS-2125DL' OR UPPER(description) = '4000 LB  WHEEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GSC', 'Adam''S Advanced Graphene Ceramic Spray Coating (12', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 50.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GSC' OR UPPER(description) = 'ADAM''S ADVANCED GRAPHENE CERAMIC SPRAY COATING (12');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GSL26', 'Klean Strip Denatured Alcohol', 'MISC/SHOP SUPPLIES', 'TORK', 'GSL26', 0, 18.21, 27.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GSL26' OR UPPER(description) = 'KLEAN STRIP DENATURED ALCOHOL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GSWH-2', 'Lp Gas Tankless Water Heater', 'MISC/SHOP SUPPLIES', 'AMAZO', 'GIRARD PRODUCTS', 0, 592.68, 951.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GSWH-2' OR UPPER(description) = 'LP GAS TANKLESS WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GW1928D00WRB', 'Carefree Awning', 'MISC/SHOP SUPPLIES', 'ADFAS', 'GW1928D00WRB', 0, 1672.0, 2253.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GW1928D00WRB' OR UPPER(description) = 'CAREFREE AWNING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'GX-16 AWG-5M-8', '16 Ft. Wire Loom For Dront Awning Arm', 'MISC/SHOP SUPPLIES', 'TORK', 'GX-16 AWG-5M-8', 0, 28.99, 57.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'GX-16 AWG-5M-8' OR UPPER(description) = '16 FT. WIRE LOOM FOR DRONT AWNING ARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'H01-B-A-06-00', 'Gauge End Connectors', 'MISC/SHOP SUPPLIES', 'E&G', 'H01-B-A-06-00', 0, 0.0, 3.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'H01-B-A-06-00' OR UPPER(description) = 'GAUGE END CONNECTORS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'H-41699', 'Brass Ball Valve 1/4 "', 'MISC/SHOP SUPPLIES', 'TORK', 'H-41699', 8, 23.4, 46.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'H-41699' OR UPPER(description) = 'BRASS BALL VALVE 1/4 "');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'h530', 'Sliding Door Wheel & Hangar 2Pk', 'MISC/SHOP SUPPLIES', 'TORK', 'h530', 0, 19.21, 38.42, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'h530' OR UPPER(description) = 'SLIDING DOOR WHEEL & HANGAR 2PK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HA/11125', '1 Inch X 1Inch 1/8 Angle Iron', 'MISC/SHOP SUPPLIES', '.....', 'HA/11125', 0, 1.49, 4.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HA/11125' OR UPPER(description) = '1 INCH X 1INCH 1/8 ANGLE IRON');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎HA-34-1', 'Pex Swivel Elbow Adapter 1/2" Brass', 'MISC/SHOP SUPPLIES', 'AMAZO', '‎HA-34-1', 14, 3.06, 6.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎HA-34-1' OR UPPER(description) = 'PEX SWIVEL ELBOW ADAPTER 1/2" BRASS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HBAK-14', 'Heat Battery Add On Kit', 'SOLAR', 'DRAGO', 'HBAK-14', 0, 1.2, 1.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HBAK-14' OR UPPER(description) = 'HEAT BATTERY ADD ON KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HBK-25', 'Heat Battery Kit', 'SOLAR', 'DRAGO', '', 0, 9.37, 13.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HBK-25' OR UPPER(description) = 'HEAT BATTERY KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HD-112', 'Jwrap Skirt 17X142', 'MISC/SHOP SUPPLIES', 'TORK', 'HD-112', 0, 151.43, 212.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HD-112' OR UPPER(description) = 'JWRAP SKIRT 17X142');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HD24-DP', 'Group 24 Deep Cycle', 'MISC/SHOP SUPPLIES', 'TORK', 'HD24-DP', 0, 114.95, 160.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HD24-DP' OR UPPER(description) = 'GROUP 24 DEEP CYCLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HECASA', 'Fender Skirts Metal Unpainted', 'MISC/SHOP SUPPLIES', 'TORK', 'HECASA', 0, 59.95, 119.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HECASA' OR UPPER(description) = 'FENDER SKIRTS METAL UNPAINTED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HEJW-5', 'Heat Enable Jumper Wire', 'MISC/SHOP SUPPLIES', 'DRAGO', '', 0, 1.25, 1.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HEJW-5' OR UPPER(description) = 'HEAT ENABLE JUMPER WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HF/1882', 'Hot Rolled  Flat Bar 0.188X2.0" Metal 20"', 'MISC/SHOP SUPPLIES', 'TORK', 'HF/1882', 0, 20.63, 41.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HF/1882' OR UPPER(description) = 'HOT ROLLED  FLAT BAR 0.188X2.0" METAL 20"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HM300', 'Group 24 Battery Box', 'MISC/SHOP SUPPLIES', 'TORK', 'HM300', 0, 9.99, 13.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HM300' OR UPPER(description) = 'GROUP 24 BATTERY BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HM327BKS', 'Group 27 Large Battery Box', 'ELECTRICAL', 'TORK', 'HM327BKS', 0, 12.8, 27.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HM327BKS' OR UPPER(description) = 'GROUP 27 LARGE BATTERY BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HMEG', 'Bussmann Hmeg Fuse Block/Holder With Cover For Amg', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 6, 12.11, 30.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HMEG' OR UPPER(description) = 'BUSSMANN HMEG FUSE BLOCK/HOLDER WITH COVER FOR AMG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HOMT1515CP', 'Homeline 2-15 Amp Single Pole Tandem Circuit Break', 'MISC/SHOP SUPPLIES', 'HDEPO', 'HOMT1515CP', 0, 16.9, 33.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HOMT1515CP' OR UPPER(description) = 'HOMELINE 2-15 AMP SINGLE POLE TANDEM CIRCUIT BREAK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HRB1', 'Spring Eye Bushing Kit', 'MISC/SHOP SUPPLIES', 'IRON', 'HRB1', 0, 4.99, 9.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HRB1' OR UPPER(description) = 'SPRING EYE BUSHING KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HTS9032', 'Thermostat Assembly', 'MISC/SHOP SUPPLIES', 'TORK', 'HTS9032', 0, 56.41, 93.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HTS9032' OR UPPER(description) = 'THERMOSTAT ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HTTMT', 'Httmt- 2Pcs Black 14" X 14" Replacement Impact-Res', 'ROOFING', 'TORK', 'HTTMT', 2, 0.0, 55.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HTTMT' OR UPPER(description) = 'HTTMT- 2PCS BLACK 14" X 14" REPLACEMENT IMPACT-RES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HYKOLITY', 'Hykolity 8Ft Led Shop Light, 65/75/90W Led Strip L', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 208.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HYKOLITY' OR UPPER(description) = 'HYKOLITY 8FT LED SHOP LIGHT, 65/75/90W LED STRIP L');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HZ-020', 'Buss Bar 5/16" Distribution Block', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 47.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HZ-020' OR UPPER(description) = 'BUSS BAR 5/16" DISTRIBUTION BLOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'HZBus', '4 Stud Power Bus Bar Juction Block 250 A 12V', 'MISC/SHOP SUPPLIES', 'AMAZO', 'HZBus', 0, 23.99, 47.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'HZBus' OR UPPER(description) = '4 STUD POWER BUS BAR JUCTION BLOCK 250 A 12V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'I04255H', 'U5806 11/2 Hxh 45 Elbow Abs', 'PLUMBING', 'AMAZO', 'U5806112', 0, 0.0, 5.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'I04255H' OR UPPER(description) = 'U5806 11/2 HXH 45 ELBOW ABS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'I05555H', 'Nibco - I05555H U5807 3 Hxh 90 Elbow Abs, Black, 3', 'PLUMBING', 'AMAZO', 'U58073', 2, 0.0, 15.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'I05555H' OR UPPER(description) = 'NIBCO - I05555H U5807 3 HXH 90 ELBOW ABS, BLACK, 3');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'I05820H', 'Nibco U58072 3 Spgxh 90 Street Elbow Abs Black, 3', 'PLUMBING', 'AMAZO', 'U580723', 0, 0.0, 16.51, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'I05820H' OR UPPER(description) = 'NIBCO U58072 3 SPGXH 90 STREET ELBOW ABS BLACK, 3');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ILL70CBAWN', 'Led Light Strip', 'MISC/SHOP SUPPLIES', 'ETRAI', 'ILL70CBAWN', 0, 38.96, 54.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ILL70CBAWN' OR UPPER(description) = 'LED LIGHT STRIP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'IM8505-100', '5/8" Chrome Molding', 'MISC/SHOP SUPPLIES', 'AS BC', '', 57, 0.0, 364.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'IM8505-100' OR UPPER(description) = '5/8" CHROME MOLDING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'IP48', 'Holding Tank Patch Kit', 'MISC/SHOP SUPPLIES', 'AMAZO', 'IP48', 0, 24.24, 48.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'IP48' OR UPPER(description) = 'HOLDING TANK PATCH KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'IP65-300A', 'Victron Smartshunt', 'MISC/SHOP SUPPLIES', '.....', 'IP65-300A', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'IP65-300A' OR UPPER(description) = 'VICTRON SMARTSHUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ISE002L', 'Solar Connectors Y Branch', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 16.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ISE002L' OR UPPER(description) = 'SOLAR CONNECTORS Y BRANCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ITC1036', 'Y Adapter', 'MISC/SHOP SUPPLIES', 'TORK', 'ITC1036', 0, 13.99, 27.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ITC1036' OR UPPER(description) = 'Y ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ITC3018', 'Zamp Adaptor 12V.', 'SOLAR', 'GOPOW', 'ITC3018', 0, 0.0, 18.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ITC3018' OR UPPER(description) = 'ZAMP ADAPTOR 12V.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'JE200625A47', 'Carefree Je200625A47 Black 200" Long X 47" Project', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 184.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'JE200625A47' OR UPPER(description) = 'CAREFREE JE200625A47 BLACK 200" LONG X 47" PROJECT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'JEZ00625A47', 'Slide Topper Fabric Black', 'MISC/SHOP SUPPLIES', 'TORK', 'JEZ00625A47', 0, 277.29, 388.21, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'JEZ00625A47' OR UPPER(description) = 'SLIDE TOPPER FABRIC BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'JF-26-10', 'Shut Off Valve 1/2" Pex X 1/2" P', 'MISC/SHOP SUPPLIES', 'LIPPE', 'ASTM F1807', 8, 4.29, 32.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'JF-26-10' OR UPPER(description) = 'SHUT OFF VALVE 1/2" PEX X 1/2" P');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'JX-T20', 'Jxmtspw Tv Wall Mount Fixed Monitor Bracket Low Pr', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 22.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'JX-T20' OR UPPER(description) = 'JXMTSPW TV WALL MOUNT FIXED MONITOR BRACKET LOW PR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'JY16JF1501', 'Jayflight Slx Metal Front Graphics Kit', 'MISC/SHOP SUPPLIES', 'TORK', 'JY16JF1501', 0, 226.2, 316.68, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'JY16JF1501' OR UPPER(description) = 'JAYFLIGHT SLX METAL FRONT GRAPHICS KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K01401777', 'Krylon Metalic Silver Spray Paint', 'MISC/SHOP SUPPLIES', '.....', 'K01401777', 0, 10.19, 17.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K01401777' OR UPPER(description) = 'KRYLON METALIC SILVER SPRAY PAINT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K102019', 'Dometic Vent Lid Smoke', 'MISC/SHOP SUPPLIES', 'TORK', 'K102019', 0, 50.19, 75.29, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K102019' OR UPPER(description) = 'DOMETIC VENT LID SMOKE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K1031-05', 'Speed Switch With Nut', 'MISC/SHOP SUPPLIES', '.....', 'K1031-05', 0, 21.57, 43.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K1031-05' OR UPPER(description) = 'SPEED SWITCH WITH NUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K1140-09', 'Atwood Vent Lift Knob 2"', 'MISC/SHOP SUPPLIES', 'TORK', 'K1140-09', 0, 11.5, 23.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K1140-09' OR UPPER(description) = 'ATWOOD VENT LIFT KNOB 2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K71-057-00', '7" Dexter Magnet', 'MISC/SHOP SUPPLIES', '.....', 'K71-057-00', 0, 21.59, 43.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K71-057-00' OR UPPER(description) = '7" DEXTER MAGNET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K71-104-00', 'Dexter Magnet Ova; 10 X 2.25', 'MISC/SHOP SUPPLIES', 'TORK', 'K71-104-00', 0, 33.03, 66.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K71-104-00' OR UPPER(description) = 'DEXTER MAGNET OVA; 10 X 2.25');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K71-707-02', 'Dexter #10 Torflex Lift Kit 2.66" Tall 2350 Lb', 'MISC/SHOP SUPPLIES', 'IRON', 'K71-707-02', 0, 186.0, 325.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K71-707-02' OR UPPER(description) = 'DEXTER #10 TORFLEX LIFT KIT 2.66" TALL 2350 LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'k71-707-02', 'Dexter Lift Kit For 2 Axles', 'MISC/SHOP SUPPLIES', 'IRON', 'k71-707-02', 0, 0.0, 309.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'k71-707-02' OR UPPER(description) = 'DEXTER LIFT KIT FOR 2 AXLES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K71-724-02', 'Dexter Lift Kit #11 Torflex 2.88" Tall 4400Lb', 'MISC/SHOP SUPPLIES', 'IRON', 'K71-724-02', 1, 278.81, 362.45, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K71-724-02' OR UPPER(description) = 'DEXTER LIFT KIT #11 TORFLEX 2.88" TALL 4400LB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K8017-00', 'Fantastic Fan Motor Dometic', 'MISC/SHOP SUPPLIES', 'AMAZO', 'K8017-00', 1, 33.12, 65.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K8017-00' OR UPPER(description) = 'FANTASTIC FAN MOTOR DOMETIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'K826-34PC', '1 1/2" Shower Drain  Push/Pull Roller Ball Metal', 'MISC/SHOP SUPPLIES', 'ETRAI', 'K826-34PC', 0, 19.18, 32.61, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'K826-34PC' OR UPPER(description) = '1 1/2" SHOWER DRAIN  PUSH/PULL ROLLER BALL METAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KEY107', 'Tag Soft Plastic Keychains - 100 Pack - Customizab', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 88.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KEY107' OR UPPER(description) = 'TAG SOFT PLASTIC KEYCHAINS - 100 PACK - CUSTOMIZAB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1008', 'Kit, 115W, Silver Ex Zamp Solar', 'MISC/SHOP SUPPLIES', 'GOPOW', 'KIT1008', 0, 339.0, 474.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1008' OR UPPER(description) = 'KIT, 115W, SILVER EX ZAMP SOLAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1010', 'Legacy Silver 90 Watt Solar Panels', 'MISC/SHOP SUPPLIES', 'E&G', 'KIT1010', 0, 670.0, 938.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1010' OR UPPER(description) = 'LEGACY SILVER 90 WATT SOLAR PANELS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT-10106725766070479', 'Np Auto Oval Led Tail Lights', 'MISC/SHOP SUPPLIES', 'TORK', 'KIT-10106725766070479', 0, 17.99, 35.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT-10106725766070479' OR UPPER(description) = 'NP AUTO OVAL LED TAIL LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1021', 'Kit 95W Black Long Dx', 'SOLAR', 'GOPOW', '', 0, 459.0, 674.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1021' OR UPPER(description) = 'KIT 95W BLACK LONG DX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'kit1022', 'Airstream Legacy 95 Watt Zamp Solar Panel', 'MISC/SHOP SUPPLIES', '.....', 'kit1022', 0, 169.99, 293.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'kit1022' OR UPPER(description) = 'AIRSTREAM LEGACY 95 WATT ZAMP SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1022', 'Zamp Legacy Series 95 W Solar Panel', 'MISC/SHOP SUPPLIES', 'GOPOW', 'KIT1022', 0, 0.0, 287.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1022' OR UPPER(description) = 'ZAMP LEGACY SERIES 95 W SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1023', 'Zamp Legacy Black 190 Watt Solar Panel', 'MISC/SHOP SUPPLIES', '.....', 'KIT1023', 0, 329.99, 527.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1023' OR UPPER(description) = 'ZAMP LEGACY BLACK 190 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1026', 'Legacy 190 Watt Solar Expansion Kit', 'MISC/SHOP SUPPLIES', 'TORK', 'KIT1026', 0, 0.0, 440.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1026' OR UPPER(description) = 'LEGACY 190 WATT SOLAR EXPANSION KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1027', 'Legacy Black Delux Solar Kit 76- Watts', 'MISC/SHOP SUPPLIES', 'TORK', 'KIT1027', 0, 0.0, 2599.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1027' OR UPPER(description) = 'LEGACY BLACK DELUX SOLAR KIT 76- WATTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KIT1029', 'Zamp Legacy Black 95 W', 'MISC/SHOP SUPPLIES', 'TORK', 'KIT1029', 0, 0.0, 453.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KIT1029' OR UPPER(description) = 'ZAMP LEGACY BLACK 95 W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KT12ACR-2', '2-Stage Auto Changeover Lp Gas Regulator', 'MISC/SHOP SUPPLIES', 'TORK', 'KT12ACR-2', 0, 33.12, 56.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KT12ACR-2' OR UPPER(description) = '2-STAGE AUTO CHANGEOVER LP GAS REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'KY25TL', 'Carefree White Slideout Arm', 'MISC/SHOP SUPPLIES', 'TORK', 'KY25TL', 0, 85.0, 119.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'KY25TL' OR UPPER(description) = 'CAREFREE WHITE SLIDEOUT ARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'L03YMC4-1', 'Eco-Worthy Solar Connector"Y"', 'MISC/SHOP SUPPLIES', 'TORK', 'L03YMC4-1', 0, 6.96, 13.92, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'L03YMC4-1' OR UPPER(description) = 'ECO-WORTHY SOLAR CONNECTOR"Y"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'L2352', 'Shower Valve  Moen', 'MISC/SHOP SUPPLIES', 'TORK', 'L2352', 0, 115.88, 168.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'L2352' OR UPPER(description) = 'SHOWER VALVE  MOEN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'L425', 'Cam Lock, 5/8 Inch, Keyed', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 3, 0.0, 51.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'L425' OR UPPER(description) = 'CAM LOCK, 5/8 INCH, KEYED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'l425', 'Compartment Lock Tumbler W/ Key', 'MISC/SHOP SUPPLIES', 'TORK', 'l425', 0, 3.85, 11.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'l425' OR UPPER(description) = 'COMPARTMENT LOCK TUMBLER W/ KEY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'L5', 'Eccotemp L5 1.5 Gpm Portable Outdoor Tankless Wate', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 208.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'L5' OR UPPER(description) = 'ECCOTEMP L5 1.5 GPM PORTABLE OUTDOOR TANKLESS WATE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'L7-SXGW-OJ6M', 'Reflective Hie Foam Insulation Heat Shield 48" X 4', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 33.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'L7-SXGW-OJ6M' OR UPPER(description) = 'REFLECTIVE HIE FOAM INSULATION HEAT SHIELD 48" X 4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LC#1', 'Cutting Paste', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 21.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LC#1' OR UPPER(description) = 'CUTTING PASTE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LC3723383', 'Kwikee Step', 'DOORS/WINDOWS/AWNINGS', 'TORK', 'LC3723383', 0, 0.0, 816.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LC3723383' OR UPPER(description) = 'KWIKEE STEP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LevenOffice001', 'Deli Effortless Standard Desktop Stapler, One Fing', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 15.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LevenOffice001' OR UPPER(description) = 'DELI EFFORTLESS STANDARD DESKTOP STAPLER, ONE FING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LFA-124', '3/8 X 1/2 Adapter Compression', 'PLUMBING', '.....', 'LFA-124', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LFA-124' OR UPPER(description) = '3/8 X 1/2 ADAPTER COMPRESSION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LFA-165', 'Brass 3/8 Union Flair', 'MISC/SHOP SUPPLIES', 'TORK', 'LFA-165', 0, 9.37, 15.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LFA-165' OR UPPER(description) = 'BRASS 3/8 UNION FLAIR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LFA-276', 'Flare Union 1/2 " X 3/8 In Mip', 'MISC/SHOP SUPPLIES', 'ETRAI', 'LFA-276', 0, 5.05, 10.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LFA-276' OR UPPER(description) = 'FLARE UNION 1/2 " X 3/8 IN MIP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LG-145236', 'Stromberg/Carlson Switch And Harness', 'MISC/SHOP SUPPLIES', 'TLR W', 'LG-145236', 0, 85.0, 119.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LG-145236' OR UPPER(description) = 'STROMBERG/CARLSON SWITCH AND HARNESS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'lined4x6', 'Lined Sticky Notes 4X6 In Bright Ruled Post Sticki', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 12.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'lined4x6' OR UPPER(description) = 'LINED STICKY NOTES 4X6 IN BRIGHT RULED POST STICKI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LK-T005', 'Pexclamps 1/2"', 'MISC/SHOP SUPPLIES', 'TORK', 'LK-T005', 0, 0.0, 1.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LK-T005' OR UPPER(description) = 'PEXCLAMPS 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LM2000 S', 'Sherline (5780) Trailer Hydraulic Tongue Weight Sc', 'TOWING/CHASSIS', 'AMAZN', '', 0, 0.0, 195.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LM2000 S' OR UPPER(description) = 'SHERLINE (5780) TRAILER HYDRAULIC TONGUE WEIGHT SC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LM-BK-34-100', 'Wiring Loom, Split Looming Tubing, Cable Loom 3/4"', 'MISC/SHOP SUPPLIES', 'AMAZO', '6543870210', 0, 0.0, 48.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LM-BK-34-100' OR UPPER(description) = 'WIRING LOOM, SPLIT LOOMING TUBING, CABLE LOOM 3/4"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'lmt-20-w', '20 Ft 12V. Lights', 'ELECTRICAL', 'TORK', 'lmt-20-w', 0, 25.99, 38.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'lmt-20-w' OR UPPER(description) = '20 FT 12V. LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'lp12-100h-t14', '12V 100Ah Agm Battery', 'MISC/SHOP SUPPLIES', 'TORK', 'lp12-100h-t14', 0, 232.09, 324.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'lp12-100h-t14' OR UPPER(description) = '12V 100AH AGM BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LR9806', 'Kib Lr9806 Latching Relay', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 97.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LR9806' OR UPPER(description) = 'KIB LR9806 LATCHING RELAY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LUM-IP07L', 'Led Utility Light  White', 'MISC/SHOP SUPPLIES', 'AMAZO', 'LUMITRONICS', 3, 0.0, 25.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LUM-IP07L' OR UPPER(description) = 'LED UTILITY LIGHT  WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LUM-IP09L', 'Spot Light', 'MISC/SHOP SUPPLIES', 'TORK', 'LUM-IP09L', 0, 12.99, 25.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LUM-IP09L' OR UPPER(description) = 'SPOT LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'LUM-MP1R', '4X2  Red Marker Light Lumitronics', 'MISC/SHOP SUPPLIES', 'TORK', 'LUM-MP1R', 0, 4.42, 6.63, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'LUM-MP1R' OR UPPER(description) = '4X2  RED MARKER LIGHT LUMITRONICS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3485', 'Black Foot Insert', 'HARDWARE', 'TORK', 'M3485', 0, 0.3, 0.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3485' OR UPPER(description) = 'BLACK FOOT INSERT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3818', 'Flat Insert Molding Polar 16''', 'MISC/SHOP SUPPLIES', 'TMC', '', 1, 0.0, 51.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3818' OR UPPER(description) = 'FLAT INSERT MOLDING POLAR 16''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3824', '16'' Black Lip Insert', 'HARDWARE', 'TORK', 'M3824', 0, 27.95, 55.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3824' OR UPPER(description) = '16'' BLACK LIP INSERT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3828', 'Black Leg Insert 16''', 'HARDWARE', 'TORK', 'M3828', 0, 39.95, 79.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3828' OR UPPER(description) = 'BLACK LEG INSERT 16''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3847', 'Large Cap Trim Polar 12''', 'MISC/SHOP SUPPLIES', 'TORK', 'M3847', 1, 37.26, 74.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3847' OR UPPER(description) = 'LARGE CAP TRIM POLAR 12''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3865', 'Vinyl Cap Base Mill 12''', 'HARDWARE', 'TORK', 'M3865', 0, 12.95, 25.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3865' OR UPPER(description) = 'VINYL CAP BASE MILL 12''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M3870', 'White Vinyl Cap Trim W/Lip', 'MISC/SHOP SUPPLIES', 'TORK', 'M3870', 0, 0.85, 2.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M3870' OR UPPER(description) = 'WHITE VINYL CAP TRIM W/LIP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'M394FR', 'Spring Assembly For Rear Door', 'MISC/SHOP SUPPLIES', '', 'M394FR', 0, 166.96, 250.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'M394FR' OR UPPER(description) = 'SPRING ASSEMBLY FOR REAR DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MA00-07500K', 'Maxxfan Deluxe Roof Vent 10 Speed Black', 'MISC/SHOP SUPPLIES', 'TORK', 'MA00-07500K', 0, 0.0, 359.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MA00-07500K' OR UPPER(description) = 'MAXXFAN DELUXE ROOF VENT 10 SPEED BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MATS-011', 'Zundian 1400 Amp Battery Jump Starter With Air Com', 'ELECTRICAL', 'AMAZN', '', 0, 0.0, 223.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MATS-011' OR UPPER(description) = 'ZUNDIAN 1400 AMP BATTERY JUMP STARTER WITH AIR COM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MAXIM-14.5X 22.5', 'Maxim Skylight', 'MISC/SHOP SUPPLIES', 'ETRAI', 'MAXIM-14.5X 22.5', 0, 326.0, 423.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MAXIM-14.5X 22.5' OR UPPER(description) = 'MAXIM SKYLIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MAXRECT', 'Maxim 17.75" X 22.75" Rectangle Skylight', 'MISC/SHOP SUPPLIES', 'TORK', '', 4, 0.0, 357.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MAXRECT' OR UPPER(description) = 'MAXIM 17.75" X 22.75" RECTANGLE SKYLIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MAXSQ', 'Maxim 22.75 X 22.75 Square Skylight', 'MISC/SHOP SUPPLIES', 'TORK', '', 3, 0.0, 435.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MAXSQ' OR UPPER(description) = 'MAXIM 22.75 X 22.75 SQUARE SKYLIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MD001', 'Botten 400Pcs 10 Sizes Aluminum Pop Rivets,Flange', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 22.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MD001' OR UPPER(description) = 'BOTTEN 400PCS 10 SIZES ALUMINUM POP RIVETS,FLANGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MDL250V', '5 Amp Blow Fuse', 'MISC/SHOP SUPPLIES', 'AMAZO', 'MDL250V', 0, 11.25, 22.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MDL250V' OR UPPER(description) = '5 AMP BLOW FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MEGR-253', 'Propane Regulator', 'MISC/SHOP SUPPLIES', 'AMAZO', 'MEGR-253', 0, 60.37, 90.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MEGR-253' OR UPPER(description) = 'PROPANE REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MEGR-253P', 'Propane Regulator 2-Stage', 'MISC/SHOP SUPPLIES', 'AMAZO', 'MEGR-253P', 2, 64.72, 103.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MEGR-253P' OR UPPER(description) = 'PROPANE REGULATOR 2-STAGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MEGR-253P-PT15', 'Marshall Excelsior Lp Regulator', 'MISC/SHOP SUPPLIES', 'AMAZO', 'MEGR-253P-PT15', 0, 88.33, 176.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MEGR-253P-PT15' OR UPPER(description) = 'MARSHALL EXCELSIOR LP REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MEGR-RVB', 'Universal L-Mount Regulator', 'PLUMBING', 'AMAZN', '', 5, 0.0, 21.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MEGR-RVB' OR UPPER(description) = 'UNIVERSAL L-MOUNT REGULATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MEN14LOLPAW', 'Carefree Awning Fabric With Led Lights', 'MISC/SHOP SUPPLIES', 'TORK', 'MEN14LOLPAW', 0, 332.0, 464.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MEN14LOLPAW' OR UPPER(description) = 'CAREFREE AWNING FABRIC WITH LED LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MGW1928D8DBRB', 'Awning Fabric For Carfree', 'MISC/SHOP SUPPLIES', 'TORK', 'MGW1928D8DBRB', 0, 277.0, 387.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MGW1928D8DBRB' OR UPPER(description) = 'AWNING FABRIC FOR CARFREE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'QZ192006ENL', 'Carefree Awning Fabric', 'MISC/SHOP SUPPLIES', 'TORK', 'QZ192006ENL', 0, 400.0, 560.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'QZ192006ENL' OR UPPER(description) = 'CAREFREE AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MM-3/16-3/8', 'Metal Magery 3/16" Diameter X 3/8" Length Solid Al', 'HARDWARE', 'AMAZO', '', 0, 0.0, 25.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MM-3/16-3/8' OR UPPER(description) = 'METAL MAGERY 3/16" DIAMETER X 3/8" LENGTH SOLID AL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MONITOR-VTDM', 'Victron Digital Multi Control 200/200A Gx', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 192.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MONITOR-VTDM' OR UPPER(description) = 'VICTRON DIGITAL MULTI CONTROL 200/200A GX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MRV375', 'Global Pro Series Entry Door Lock', 'MISC/SHOP SUPPLIES', 'TORK', 'MRV375', 0, 34.22, 68.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MRV375' OR UPPER(description) = 'GLOBAL PRO SERIES ENTRY DOOR LOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MTI 603.111', 'Safe T Alert Dual Lp Alarm', 'MISC/SHOP SUPPLIES', 'AMAZO', 'MTI 603.111', 0, 70.47, 112.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MTI 603.111' OR UPPER(description) = 'SAFE T ALERT DUAL LP ALARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MWHS34', 'Heat Shrink Multi-Wall 4'' Stk 3/4" Id, Black', 'MISC/SHOP SUPPLIES', 'RAM', '', 0, 0.0, 65.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MWHS34' OR UPPER(description) = 'HEAT SHRINK MULTI-WALL 4'' STK 3/4" ID, BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'MXUTEUK', '12V. Switch', 'MISC/SHOP SUPPLIES', 'TORK', 'MXUTEUK', 0, 6.99, 9.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'MXUTEUK' OR UPPER(description) = '12V. SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'N1422 DOME SKYLIGHT', 'Upper Skylight Lid', 'MISC/SHOP SUPPLIES', 'TLR W', 'N1422 DOME SKYLIGHT', 0, 99.0, 138.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'N1422 DOME SKYLIGHT' OR UPPER(description) = 'UPPER SKYLIGHT LID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'N1422 SHY LIGHT INNER', 'Inner 17"X25" Skylight', 'MISC/SHOP SUPPLIES', 'TLR W', 'N1422 SHY LIGHT INNER', 0, 116.89, 163.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'N1422 SHY LIGHT INNER' OR UPPER(description) = 'INNER 17"X25" SKYLIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'NOBOFRONT', 'Front Wall White/Monel Haze', 'MISC/SHOP SUPPLIES', 'TORK', 'NOBOFRONT', 0, 750.0, 975.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'NOBOFRONT' OR UPPER(description) = 'FRONT WALL WHITE/MONEL HAZE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'NPB-UV', 'Z Brackets For Solar Panel Mount', 'MISC/SHOP SUPPLIES', '.....', 'NPB-UV', 0, 21.24, 42.48, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'NPB-UV' OR UPPER(description) = 'Z BRACKETS FOR SOLAR PANEL MOUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'NR74OSS', 'Norcold Fridge 1.7 Cu Ft', 'MISC/SHOP SUPPLIES', 'TORK', 'NR74OSS', 0, 1045.0, 1463.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'NR74OSS' OR UPPER(description) = 'NORCOLD FRIDGE 1.7 CU FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'NTP_09-0097', 'Valterra Rv Trailer Pump Converter Kit Lf Cd Water', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 27.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'NTP_09-0097' OR UPPER(description) = 'VALTERRA RV TRAILER PUMP CONVERTER KIT LF CD WATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'NTP11-0620', '1 1/2" Bladex Waste Valve', 'MISC/SHOP SUPPLIES', 'TLR W', 'NTP11-0620', 0, 18.59, 27.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'NTP11-0620' OR UPPER(description) = '1 1/2" BLADEX WASTE VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OB-24PL-WS-C2', 'Cool White 4.5 Inch Rv Light', 'MISC/SHOP SUPPLIES', 'TORK', 'OB-24PL-WS-C2', 0, 9.8, 19.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OB-24PL-WS-C2' OR UPPER(description) = 'COOL WHITE 4.5 INCH RV LIGHT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OBS100', 'Obsidian 100 Watt Solar Panels', 'MISC/SHOP SUPPLIES', 'E&G', 'OBS100', 0, 379.0, 530.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OBS100' OR UPPER(description) = 'OBSIDIAN 100 WATT SOLAR PANELS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OD7178T', '7.5 Amp Fuse', 'MISC/SHOP SUPPLIES', 'TORK', 'OD7178T', 0, 6.99, 11.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OD7178T' OR UPPER(description) = '7.5 AMP FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OE001', 'Break-A-Way Switch With Cable', 'MISC/SHOP SUPPLIES', 'AMAZO', 'X003AY23FT', 6, 0.0, 24.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OE001' OR UPPER(description) = 'BREAK-A-WAY SWITCH WITH CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OMNI-ECO', 'Brake-A-Way Switch 12V.', 'MISC/SHOP SUPPLIES', '.....', 'OMNI-ECO', 0, 12.49, 24.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OMNI-ECO' OR UPPER(description) = 'BRAKE-A-WAY SWITCH 12V.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ONESS', 'Anode Rod', 'MISC/SHOP SUPPLIES', 'TORK', 'ONESS', 0, 21.69, 43.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ONESS' OR UPPER(description) = 'ANODE ROD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OS100', 'Airstream Obsidian Series 100 Watt Solar Panel', 'MISC/SHOP SUPPLIES', 'ETRAI', 'OS100', 0, 201.59, 240.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OS100' OR UPPER(description) = 'AIRSTREAM OBSIDIAN SERIES 100 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OS90', 'Airstream Obsidian Series 90 Watt Solar Panel', 'MISC/SHOP SUPPLIES', 'ETRAI', 'OS90', 0, 191.51, 210.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OS90' OR UPPER(description) = 'AIRSTREAM OBSIDIAN SERIES 90 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OTTWIRE', 'Ott Welding Wire 20'' Red & Black', 'MISC/SHOP SUPPLIES', 'LIPPE', 'OTTWIRE', 0, 258.4, 361.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OTTWIRE' OR UPPER(description) = 'OTT WELDING WIRE 20'' RED & BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'OVJVAPHW', 'Carefree Awning Arms', 'MISC/SHOP SUPPLIES', '', 'OVJVAPHW', 0, 991.44, 1397.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'OVJVAPHW' OR UPPER(description) = 'CAREFREE AWNING ARMS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'P23415LF', 'Check Valve 1/2"', 'MISC/SHOP SUPPLIES', 'AMAZO', 'P23415LF', 0, 11.36, 22.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'P23415LF' OR UPPER(description) = 'CHECK VALVE 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎P23415LF', 'Valterra Check Valve 1/2" Backflow Prevent', 'MISC/SHOP SUPPLIES', 'RICH', '‎P23415LF', 0, 15.99, 31.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎P23415LF' OR UPPER(description) = 'VALTERRA CHECK VALVE 1/2" BACKFLOW PREVENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'p23506LFVP', 'Pump Converter Kit', 'MISC/SHOP SUPPLIES', 'LIPPE', 'VALTERRA', 0, 0.0, 27.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'p23506LFVP' OR UPPER(description) = 'PUMP CONVERTER KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'P506LF', 'Water Pump Bypass Kit', 'MISC/SHOP SUPPLIES', 'TORK', 'P506LF', 0, 19.95, 27.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'P506LF' OR UPPER(description) = 'WATER PUMP BYPASS KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'P7645', '.25 Retainer Spline', 'MISC/SHOP SUPPLIES', 'TORK', 'P7645', 0, 11.98, 23.96, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'P7645' OR UPPER(description) = '.25 RETAINER SPLINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PAC11-11038', 'Petsafe Freedom Replacement Flap - Compatible With', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 37.73, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PAC11-11038' OR UPPER(description) = 'PETSAFE FREEDOM REPLACEMENT FLAP - COMPATIBLE WITH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PB-L04', 'Bathroom Faucet Silver', 'MISC/SHOP SUPPLIES', 'TORK', 'PB-L04', 0, 18.8, 37.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PB-L04' OR UPPER(description) = 'BATHROOM FAUCET SILVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PD34FR', '1000 Watt Pure Sine Wave Inverter', 'MISC/SHOP SUPPLIES', 'TORK', 'PD34FR', 0, 305.05, 442.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PD34FR' OR UPPER(description) = '1000 WATT PURE SINE WAVE INVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PD4655V', '55Amp Power Converter', 'MISC/SHOP SUPPLIES', 'TORK', 'PD4655V', 0, 254.11, 406.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PD4655V' OR UPPER(description) = '55AMP POWER CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PEASTORM', 'Steel Battery Box', 'ELECTRICAL', 'AMAZO', '', 1, 0.0, 146.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PEASTORM' OR UPPER(description) = 'STEEL BATTERY BOX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PF223242', 'Vallterra Shower Faucet', 'MISC/SHOP SUPPLIES', 'TORK', 'PF223242', 0, 14.87, 29.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PF223242' OR UPPER(description) = 'VALLTERRA SHOWER FAUCET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎PI000-11-01-1520-001', '1/2" Abs Pipe 1''', 'MISC/SHOP SUPPLIES', 'TORK', '‎PI000-11-01-1520-001', 0, 7.23, 10.12, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎PI000-11-01-1520-001' OR UPPER(description) = '1/2" ABS PIPE 1''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PL720S-WT RV', 'Interior Shower Faucet030955025186', 'MISC/SHOP SUPPLIES', 'AMAZO', 'PL720S-WT RV', 0, 19.37, 38.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PL720S-WT RV' OR UPPER(description) = 'INTERIOR SHOWER FAUCET030955025186');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PLTLITE', 'Double Stick Foam Tape', 'MISC/SHOP SUPPLIES', 'ETRAI', 'PLTLITE', 0, 7.93, 15.86, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PLTLITE' OR UPPER(description) = 'DOUBLE STICK FOAM TAPE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PMP122200102', 'Victron 2000 Watt Inverter', 'MISC/SHOP SUPPLIES', 'AMAZO', 'PMP122200102', 0, 1023.4, 1432.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PMP122200102' OR UPPER(description) = 'VICTRON 2000 WATT INVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PMP122305100', 'Victron Energy Multiplus-Ii 2X 120V, 3000Va 12-Vol', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 2045.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PMP122305100' OR UPPER(description) = 'VICTRON ENERGY MULTIPLUS-II 2X 120V, 3000VA 12-VOL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PMP122305102', 'Victron Energy Multiplus Ii Power Inverter 12-3000', 'MISC/SHOP SUPPLIES', 'AMAZO', 'PMP122305102', 0, 1001.04, 1601.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PMP122305102' OR UPPER(description) = 'VICTRON ENERGY MULTIPLUS II POWER INVERTER 12-3000');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PMP123021010', 'Multiplus 12/3000/120-50 - 230V Ve.Bus Inverter/Ch', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 2400.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PMP123021010' OR UPPER(description) = 'MULTIPLUS 12/3000/120-50 - 230V VE.BUS INVERTER/CH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'pmp123021102', 'Multi Plus Victron12V.-3000Va-120Amp Inverter', 'MISC/SHOP SUPPLIES', 'TORK', 'pmp123021102', 0, 1374.32, 1800.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'pmp123021102' OR UPPER(description) = 'MULTI PLUS VICTRON12V.-3000VA-120AMP INVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PMP123021102', 'Multiplus 12 Volt 120 Amp 3000 Va Inverter Victron', 'MISC/SHOP SUPPLIES', 'TORK', 'PMP123021102', 0, 1186.79, 1542.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PMP123021102' OR UPPER(description) = 'MULTIPLUS 12 VOLT 120 AMP 3000 VA INVERTER VICTRON');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'POU1/2NPTW/DRILL', 'Drill America - Pou1/2Nptw/Drill 1/2" Carbon Steel', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 15.27, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'POU1/2NPTW/DRILL' OR UPPER(description) = 'DRILL AMERICA - POU1/2NPTW/DRILL 1/2" CARBON STEEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'POWER-AWN-SWITCH-KIT', 'Solera Power Awning Switch Kit Heavy Duty', 'MISC/SHOP SUPPLIES', 'TORK', 'POWER-AWN-SWITCH-KIT', 0, 46.85, 65.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'POWER-AWN-SWITCH-KIT' OR UPPER(description) = 'SOLERA POWER AWNING SWITCH KIT HEAVY DUTY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PR108NSF', 'Recpro 1/2" Pressurized Hot & Cold Water Line Hose', 'MISC/SHOP SUPPLIES', 'RICH', 'PR108NSF', 0, 59.95, 119.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PR108NSF' OR UPPER(description) = 'RECPRO 1/2" PRESSURIZED HOT & COLD WATER LINE HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PR4', '25" Spring Leaf 2"', 'MISC/SHOP SUPPLIES', 'TORK', 'PR4', 0, 35.81, 50.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PR4' OR UPPER(description) = '25" SPRING LEAF 2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PTC-1/2-15', 'Pvc End Cap Plug', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 17.54, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PTC-1/2-15' OR UPPER(description) = 'PVC END CAP PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PURAGEIR-734PPS', 'Straight Shut Off Valve 1/2" Pex', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 10, 0.0, 7.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PURAGEIR-734PPS' OR UPPER(description) = 'STRAIGHT SHUT OFF VALVE 1/2" PEX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PVCM25', 'Solar Charge Module', 'MISC/SHOP SUPPLIES', '.....', 'PVCM25', 0, 168.0, 235.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PVCM25' OR UPPER(description) = 'SOLAR CHARGE MODULE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PVCM25D-MPTLI', '25 Amp Mpt-Li Solsr Charge Control', 'MISC/SHOP SUPPLIES', 'TORK', 'PVCM25D-MPTLI', 0, 219.95, 307.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PVCM25D-MPTLI' OR UPPER(description) = '25 AMP MPT-LI SOLSR CHARGE CONTROL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'PXPC12100JR', '1/2 Inch Clamp Stinless Pex', 'MISC/SHOP SUPPLIES', 'AMAZO', 'PXPC12100JR', 0, 0.24, 0.34, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'PXPC12100JR' OR UPPER(description) = '1/2 INCH CLAMP STINLESS PEX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'QC3.0', 'Usb Outlet W Cap', 'MISC/SHOP SUPPLIES', 'TORK', 'QC3.0', 0, 11.99, 23.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'QC3.0' OR UPPER(description) = 'USB OUTLET W CAP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'Qiilu19o2aeg8vx', 'Heat Shrink Butt Connectors,100Pcs 26-24Awg', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 20.09, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'Qiilu19o2aeg8vx' OR UPPER(description) = 'HEAT SHRINK BUTT CONNECTORS,100PCS 26-24AWG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R 7212', 'Drawer Slide Kit - Replace Drawe', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 11.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R 7212' OR UPPER(description) = 'DRAWER SLIDE KIT - REPLACE DRAWE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R001785-00X', 'Latitude Rear Awning Arm Cover Black', 'MISC/SHOP SUPPLIES', 'TORK', 'R001785-00X', 0, 37.01, 53.66, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R001785-00X' OR UPPER(description) = 'LATITUDE REAR AWNING ARM COVER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R001787-005', 'Carefree Awning Arm', 'MISC/SHOP SUPPLIES', 'TORK', 'R001787-005', 0, 256.27, 348.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R001787-005' OR UPPER(description) = 'CAREFREE AWNING ARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'r001794-005', 'Awning Arm', 'MISC/SHOP SUPPLIES', 'TORK', 'r001794-005', 0, 201.64, 288.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'r001794-005' OR UPPER(description) = 'AWNING ARM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R1005', '9.50'' 17'' Epdm Rubber Roof', 'MISC/SHOP SUPPLIES', 'TORK', 'R1005', 0, 17.51, 35.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R1005' OR UPPER(description) = '9.50'' 17'' EPDM RUBBER ROOF');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R25075', 'Gear Motor Slide Drive', 'MISC/SHOP SUPPLIES', '.....', 'R25075', 0, 69.0, 138.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R25075' OR UPPER(description) = 'GEAR MOTOR SLIDE DRIVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R25076', 'Accue Slide Gear Box And Motor', 'MISC/SHOP SUPPLIES', '.....', 'R25076', 0, 82.99, 165.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R25076' OR UPPER(description) = 'ACCUE SLIDE GEAR BOX AND MOTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'R3310524NR.315L', 'Dometic Awning Fabric Black', 'MISC/SHOP SUPPLIES', '.....', 'R3310524NR.315L', 0, 451.68, 647.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'R3310524NR.315L' OR UPPER(description) = 'DOMETIC AWNING FABRIC BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RA-2135', 'Range Cover', 'HVAC', 'ETRAI', 'RA-2135', 0, 75.0, 108.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RA-2135' OR UPPER(description) = 'RANGE COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12100LFP-BT-G1-US', 'Renogy Smart Lithium 100 Amp Self Heating Battery', 'MISC/SHOP SUPPLIES', 'RENOG', 'RBT12100LFP-BT-G1-US', 5, 346.99, 572.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12100LFP-BT-G1-US' OR UPPER(description) = 'RENOGY SMART LITHIUM 100 AMP SELF HEATING BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12100LFP-BT-US', 'Renogy Pro Series 100Ah Lithium With Bt', 'MISC/SHOP SUPPLIES', 'TORK', 'RBT12100LFP-BT-US', 0, 346.99, 529.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12100LFP-BT-US' OR UPPER(description) = 'RENOGY PRO SERIES 100AH LITHIUM WITH BT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12100LPF-BT-G1-US', '100 Ah Lithium Battery, Renogy', 'MISC/SHOP SUPPLIES', 'TORK', 'RBT12100LPF-BT-G1-US', 0, 346.99, 572.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12100LPF-BT-G1-US' OR UPPER(description) = '100 AH LITHIUM BATTERY, RENOGY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12200LFPBT-C1-US', 'Renogy 200Ah Pro Series Lithium, Bt Heated Batt', 'MISC/SHOP SUPPLIES', 'TORK', 'RBT12200LFPBT-C1-US', 0, 579.99, 811.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12200LFPBT-C1-US' OR UPPER(description) = 'RENOGY 200AH PRO SERIES LITHIUM, BT HEATED BATT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12200LFP-BT-G1-US', 'Renogy 12.8V 200Ah Pro Series Smart Lithium Batter', 'MISC/SHOP SUPPLIES', 'RENOG', 'RBT12200LFP-BT-G1-US', 0, 579.99, 753.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12200LFP-BT-G1-US' OR UPPER(description) = 'RENOGY 12.8V 200AH PRO SERIES SMART LITHIUM BATTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RBT12300LFPSH-US', 'Renogy 300Ah Deep Cycle Lithium Battery Self Heati', 'MISC/SHOP SUPPLIES', 'RENOG', 'RBT12300LFPSH-US', 1, 0.0, 950.07, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RBT12300LFPSH-US' OR UPPER(description) = 'RENOGY 300AH DEEP CYCLE LITHIUM BATTERY SELF HEATI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'REC020005010', 'Victron Multiplus Digital Multicontrol Panel For I', 'MISC/SHOP SUPPLIES', 'AMAZO', '8542046875', 0, 0.0, 216.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'REC020005010' OR UPPER(description) = 'VICTRON MULTIPLUS DIGITAL MULTICONTROL PANEL FOR I');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'REPFAB', 'Black Fade Awning Fabric', 'MISC/SHOP SUPPLIES', 'TORK', 'REPFAB', 0, 200.0, 229.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'REPFAB' OR UPPER(description) = 'BLACK FADE AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RH-RHBV-QP-48', '4 Oz. Pvc Pipe Cement', 'MISC/SHOP SUPPLIES', 'HDEPO', 'RH-RHBV-QP-48', 0, 5.65, 11.3, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RH-RHBV-QP-48' OR UPPER(description) = '4 OZ. PVC PIPE CEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RJ45', 'Qingler Rj45 Cat6 Coupler Ethernet Extender Connec', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 15.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RJ45' OR UPPER(description) = 'QINGLER RJ45 CAT6 COUPLER ETHERNET EXTENDER CONNEC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'rj9', 'Conductor Cord Cable', 'MISC/SHOP SUPPLIES', 'TORK', 'rj9', 0, 6.8, 13.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'rj9' OR UPPER(description) = 'CONDUCTOR CORD CABLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RJ9', 'Conductor Cord Cable 7 Ft', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RJ9', 0, 6.8, 13.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RJ9' OR UPPER(description) = 'CONDUCTOR CORD CABLE 7 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RKURCK', '40 Amp 12V. Circuit Breaker 12V.', 'MISC/SHOP SUPPLIES', 'TORK', 'RKURCK', 0, 9.99, 29.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RKURCK' OR UPPER(description) = '40 AMP 12V. CIRCUIT BREAKER 12V.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RLX9950', '7-Way Trailer Cord', 'MISC/SHOP SUPPLIES', '.....', 'RLX9950', 0, 18.99, 37.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RLX9950' OR UPPER(description) = '7-WAY TRAILER CORD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RLX-DL030', '7 Way Trailer End Plug', 'MISC/SHOP SUPPLIES', 'TORK', 'RLX-DL030', 0, 24.99, 49.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RLX-DL030' OR UPPER(description) = '7 WAY TRAILER END PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RM2451LB1F', 'Dometic Americana Refrigerator', 'MISC/SHOP SUPPLIES', 'TORK', 'RM2451LB1F', 0, 1358.27, 1901.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RM2451LB1F' OR UPPER(description) = 'DOMETIC AMERICANA REFRIGERATOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RMS-LFPS-G1-US', 'Renogy Smart Lithium Battery Remote Monitor', 'MISC/SHOP SUPPLIES', 'RENOG', '', 4, 0.0, 9.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RMS-LFPS-G1-US' OR UPPER(description) = 'RENOGY SMART LITHIUM BATTERY REMOTE MONITOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RNG-100D-SSx2-G3-US', '100W Rigid Solar Panel Renogy', 'MISC/SHOP SUPPLIES', 'RENOG', '', 2, 0.0, 109.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RNG-100D-SSx2-G3-US' OR UPPER(description) = '100W RIGID SOLAR PANEL RENOGY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RNG-CNCT-FUSE20-G1-US', '20-Amp Waterproof Solar Connector In-Line Fuse', 'MISC/SHOP SUPPLIES', '.....', 'RNG-CNCT-FUSE20-G1-US', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RNG-CNCT-FUSE20-G1-US' OR UPPER(description) = '20-AMP WATERPROOF SOLAR CONNECTOR IN-LINE FUSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RNG-MTS-ZB', 'Renogy Mounting Z Bracket', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RNG-MTS-ZB', 0, 12.0, 24.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RNG-MTS-ZB' OR UPPER(description) = 'RENOGY MOUNTING Z BRACKET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RNG-MTS-ZB-G1-US', 'Mounting Z Brackets - 4', 'MISC/SHOP SUPPLIES', '.....', 'RNG-MTS-ZB-G1-US', 0, 7.19, 14.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RNG-MTS-ZB-G1-US' OR UPPER(description) = 'MOUNTING Z BRACKETS - 4');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ROMEX12', 'Romex Wire 12/2 Gauge X Foot', 'MISC/SHOP SUPPLIES', 'TORK', 'ROMEX12', 0, 2.0, 3.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ROMEX12' OR UPPER(description) = 'ROMEX WIRE 12/2 GAUGE X FOOT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-1140', 'P Trap For Shower/Bath', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-1140', 0, 17.37, 34.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-1140' OR UPPER(description) = 'P TRAP FOR SHOWER/BATH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-1172-P1', 'Nautilus P1 Panel', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RP-1172-P1', 0, 272.0, 380.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-1172-P1' OR UPPER(description) = 'NAUTILUS P1 PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-1179', 'Recpro Black Fender Skirt', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-1179', 0, 159.09, 231.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-1179' OR UPPER(description) = 'RECPRO BLACK FENDER SKIRT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-1239', 'Ppsu Bypass Valves', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-1239', 0, 21.51, 43.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-1239' OR UPPER(description) = 'PPSU BYPASS VALVES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-1402', 'Pressure Temp Valve', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RP-1402', 0, 31.95, 63.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-1402' OR UPPER(description) = 'PRESSURE TEMP VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT '‎RP-1455', 'Rv Hot Water Heater Bypass Diverter Valve', 'MISC/SHOP SUPPLIES', 'RICH', '‎RP-1455', 0, 69.95, 139.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = '‎RP-1455' OR UPPER(description) = 'RV HOT WATER HEATER BYPASS DIVERTER VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-16NQ', 'Suburban Furnace Core 16,000 Btu', 'MISC/SHOP SUPPLIES', '.....', 'RP-16NQ', 0, 370.02, 518.03, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-16NQ' OR UPPER(description) = 'SUBURBAN FURNACE CORE 16,000 BTU');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-3800', 'Recpro Soft Start Ac Unit With Heat Pump', 'MISC/SHOP SUPPLIES', 'REC', 'RP-3800', 0, 1439.96, 2015.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-3800' OR UPPER(description) = 'RECPRO SOFT START AC UNIT WITH HEAT PUMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-5051', 'Skylight Inner Frame', 'MISC/SHOP SUPPLIES', 'DOM', 'RP-5051', 0, 59.79, 83.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-5051' OR UPPER(description) = 'SKYLIGHT INNER FRAME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-5051-FBA', 'Recpro Sklight Inner Dome', 'DOORS/WINDOWS/AWNINGS', 'AMAZO', '', 3, 0.0, 117.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-5051-FBA' OR UPPER(description) = 'RECPRO SKLIGHT INNER DOME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-AC3501', 'Recpro 13.5K Black Ac Non-Ducted', 'MISC/SHOP SUPPLIES', '.....', 'RP-AC3501', 0, 836.96, 1171.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-AC3501' OR UPPER(description) = 'RECPRO 13.5K BLACK AC NON-DUCTED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-AC3501-W-KT', 'Rv Air Conditioner 13.5K Quiet Non-Ducted With Rem', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-AC3501-W-KT', 0, 877.46, 1228.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-AC3501-W-KT' OR UPPER(description) = 'RV AIR CONDITIONER 13.5K QUIET NON-DUCTED WITH REM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-AC3800', 'Recpro 15K Quiet W Heat Pump, Soft Start & Remote', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-AC3800', 0, 1457.0, 2203.11, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-AC3800' OR UPPER(description) = 'RECPRO 15K QUIET W HEAT PUMP, SOFT START & REMOTE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RPC0110EC-Y-G1-US', 'Y Branch Parallel Connectors - 2', 'MISC/SHOP SUPPLIES', '.....', 'RPC0110EC-Y-G1-US', 0, 8.49, 16.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RPC0110EC-Y-G1-US' OR UPPER(description) = 'Y BRANCH PARALLEL CONNECTORS - 2');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-CT', 'Rv Gas Cooktop Black 3-Burner', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-CT', 0, 264.55, 396.83, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-CT' OR UPPER(description) = 'RV GAS COOKTOP BLACK 3-BURNER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RPD100RBB-US', '300Amp Busbar', 'MISC/SHOP SUPPLIES', 'RICH', 'RPD100RBB-US', 0, 0.0, 27.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RPD100RBB-US' OR UPPER(description) = '300AMP BUSBAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-M21', 'Recpro Rv Tank', 'PLUMBING', 'AMAZO', 'RP-M21', 0, 34.0, 68.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-M21' OR UPPER(description) = 'RECPRO RV TANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-PFD-G-3675', 'Gray Rv Pleated Folding Door', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-PFD-G-3675', 0, 78.5, 157.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-PFD-G-3675' OR UPPER(description) = 'GRAY RV PLEATED FOLDING DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-RFG-33-SS', 'Rv Refrigerator 3.3 Cubic Ft Stainless Steel', 'MISC/SHOP SUPPLIES', 'ETRAI', 'RP-RFG-33-SS', 0, 449.96, 629.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-RFG-33-SS' OR UPPER(description) = 'RV REFRIGERATOR 3.3 CUBIC FT STAINLESS STEEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RP-SA-PORT-P-BK-FBA', 'Black Outside Spray Port Hook-Up', 'MISC/SHOP SUPPLIES', 'TORK', 'RP-SA-PORT-P-BK-FBA', 0, 16.61, 33.22, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RP-SA-PORT-P-BK-FBA' OR UPPER(description) = 'BLACK OUTSIDE SPRAY PORT HOOK-UP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSHST-B02P300-G1', 'Renogy 300 Amp Shunt', 'MISC/SHOP SUPPLIES', '.....', 'RSHST-B02P300-G1', 1, 111.14, 155.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSHST-B02P300-G1' OR UPPER(description) = 'RENOGY 300 AMP SHUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSP-100D-US', '100 Watt Renogy Solar Panel Rigid', 'MISC/SHOP SUPPLIES', 'ETRAI', 'RSP-100D-US', 0, 79.04, 118.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSP-100D-US' OR UPPER(description) = '100 WATT RENOGY SOLAR PANEL RIGID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSP200DB-72-US', '200 Watt Renogy Solar Panel Flex', 'MISC/SHOP SUPPLIES', 'TORK', 'RSP200DB-72-US', 0, 314.99, 400.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSP200DB-72-US' OR UPPER(description) = '200 WATT RENOGY SOLAR PANEL FLEX');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSP200DC-ASR-US', 'Renogy 200W Shadowflux Antishading', 'MISC/SHOP SUPPLIES', 'RICH', 'RSP200DC-ASR-US', 0, 0.0, 219.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSP200DC-ASR-US' OR UPPER(description) = 'RENOGY 200W SHADOWFLUX ANTISHADING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSP200D-G3-US', '200 Watt Renogy Rigid Solar Panel', 'MISC/SHOP SUPPLIES', 'TORK', 'RSP200D-G3-US', 0, 146.99, 293.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSP200D-G3-US' OR UPPER(description) = '200 WATT RENOGY RIGID SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSP200D-US', '200 Watt Renogy Solar Panel Rigid', 'MISC/SHOP SUPPLIES', 'TORK', 'RSP200D-US', 0, 146.99, 220.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSP200D-US' OR UPPER(description) = '200 WATT RENOGY SOLAR PANEL RIGID');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RST-F', 'Circlecord Rv Roof Tape White, 2 Inch X 50 Feet Rv', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 26.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RST-F' OR UPPER(description) = 'CIRCLECORD RV ROOF TAPE WHITE, 2 INCH X 50 FEET RV');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RSW-2-50', 'Eternabond', 'MISC/SHOP SUPPLIES', 'ETRAI', 'RSW-2-50', 0, 42.49, 42.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RSW-2-50' OR UPPER(description) = 'ETERNABOND');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV129R', '50 Amp Shore Power Inlet', 'MISC/SHOP SUPPLIES', '.....', 'RV129R', 0, 89.99, 179.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV129R' OR UPPER(description) = '50 AMP SHORE POWER INLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV1T', 'Black Vinal Screw Cover 50''', 'MISC/SHOP SUPPLIES', 'TORK', 'RV1T', 0, 0.27, 0.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV1T' OR UPPER(description) = 'BLACK VINAL SCREW COVER 50''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV281', 'Swivel Drain Adapter 1 1/2" Fitting', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RV281', 0, 18.59, 37.18, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV281' OR UPPER(description) = 'SWIVEL DRAIN ADAPTER 1 1/2" FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV282', 'Swivel Tray Female Tray Plug', 'MISC/SHOP SUPPLIES', 'TORK', 'RV282', 0, 8.99, 17.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV282' OR UPPER(description) = 'SWIVEL TRAY FEMALE TRAY PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV34T', 'Automotive Authority White Vinyl 3/4" Insert Moldi', 'HARDWARE', 'AMAZO', '', 0, 0.0, 16.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV34T' OR UPPER(description) = 'AUTOMOTIVE AUTHORITY WHITE VINYL 3/4" INSERT MOLDI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RV-7032', 'Plate Power Supply Winegard', 'ELECTRICAL', 'DRAGO', '', 0, 0.0, 55.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RV-7032' OR UPPER(description) = 'PLATE POWER SUPPLY WINEGARD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RVLP-2B', 'Propane Detector', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RVLP-2B', 0, 47.73, 66.82, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RVLP-2B' OR UPPER(description) = 'PROPANE DETECTOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RVLv4.0', 'Rvlock Keyless', 'MISC/SHOP SUPPLIES', 'TORK', 'RVLv4.0', 0, 199.99, 279.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RVLv4.0' OR UPPER(description) = 'RVLOCK KEYLESS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RVPAT', 'Battery Disconnect Switch', 'MISC/SHOP SUPPLIES', 'TORK', 'RVPAT', 0, 23.99, 47.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RVPAT' OR UPPER(description) = 'BATTERY DISCONNECT SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RVTRMLTCH', 'Rv Vinyl Insert 75'' Screwcover', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RVTRMLTCH', 0, 39.99, 79.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RVTRMLTCH' OR UPPER(description) = 'RV VINYL INSERT 75'' SCREWCOVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RVWINDOWSEAL001', 'Window Glazing 13Ft', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RVWINDOWSEAL001', 0, 16.98, 23.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RVWINDOWSEAL001' OR UPPER(description) = 'WINDOW GLAZING 13FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RW040-50R', 'Eternabond White 4" X50''', 'MISC/SHOP SUPPLIES', '.....', 'RW040-50R', 0, 56.34, 78.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RW040-50R' OR UPPER(description) = 'ETERNABOND WHITE 4" X50''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'RZ-6035', 'Winegard Antenna', 'MISC/SHOP SUPPLIES', 'AMAZO', 'RZ-6035', 0, 125.09, 175.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'RZ-6035' OR UPPER(description) = 'WINEGARD ANTENNA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'S1011', 'Tan Dicor Sealant', 'MISC/SHOP SUPPLIES', 'TORK', 'S1011', 0, 7.5, 22.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'S1011' OR UPPER(description) = 'TAN DICOR SEALANT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'S1012', 'Rubber Roof Caulk White', 'MISC/SHOP SUPPLIES', 'TMC', '', 1, 0.0, 15.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'S1012' OR UPPER(description) = 'RUBBER ROOF CAULK WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'S1414', '1/8 X 3/4 Gray Butly 24-30'' Metal', 'ROOFING', 'TMC', '', 1, 0.0, 162.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'S1414' OR UPPER(description) = '1/8 X 3/4 GRAY BUTLY 24-30'' METAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'S55-0868', '12V.  Stem Switch', 'MISC/SHOP SUPPLIES', 'NTP', 'S55-0868', 0, 10.39, 20.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'S55-0868' OR UPPER(description) = '12V.  STEM SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SAE DOT STI 03', 'Brake And Turn Signal Lights', 'ELECTRICAL', 'TORK', 'SAE DOT STI 03', 0, 22.95, 45.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SAE DOT STI 03' OR UPPER(description) = 'BRAKE AND TURN SIGNAL LIGHTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SBF135', 'Flex 1 3/8 " Fresh Tank Fill Hose', 'MISC/SHOP SUPPLIES', 'TORK', 'SBF135', 0, 19.9, 39.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SBF135' OR UPPER(description) = 'FLEX 1 3/8 " FRESH TANK FILL HOSE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SC1309', 'Battery Charger With Engine Star', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 222.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SC1309' OR UPPER(description) = 'BATTERY CHARGER WITH ENGINE STAR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SC3842-G43', 'Safty Chain 3/8-43', 'MISC/SHOP SUPPLIES', 'TORK', 'SC3842-G43', 0, 17.19, 24.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SC3842-G43' OR UPPER(description) = 'SAFTY CHAIN 3/8-43');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SCC110030210', 'Victron Smart Controller 100\30', 'MISC/SHOP SUPPLIES', 'AMAZO', 'SCC110030210', 0, 212.06, 296.88, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SCC110030210' OR UPPER(description) = 'VICTRON SMART CONTROLLER 100\30');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SCC110050210', 'Victron Energy Smartsolar Mppt 100V 50 Amp 12/24-V', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 451.84, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SCC110050210' OR UPPER(description) = 'VICTRON ENERGY SMARTSOLAR MPPT 100V 50 AMP 12/24-V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SCTCLRCRV-501', 'Skylight Complete', 'MISC/SHOP SUPPLIES', 'ETRAI', 'SCTCLRCRV-501', 0, 123.99, 198.38, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SCTCLRCRV-501' OR UPPER(description) = 'SKYLIGHT COMPLETE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SC-TILE-10', 'Scanstrut Interior Charging Socket 12/24V Usb', 'MISC/SHOP SUPPLIES', 'NTP', 'SC-TILE-10', 1, 0.0, 74.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SC-TILE-10' OR UPPER(description) = 'SCANSTRUT INTERIOR CHARGING SOCKET 12/24V USB');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SEA FLO 42 SERIES', 'Water Pump 12V.', 'MISC/SHOP SUPPLIES', 'TORK', 'SEA FLO 42 SERIES', 0, 64.99, 94.24, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SEA FLO 42 SERIES' OR UPPER(description) = 'WATER PUMP 12V.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SEA-US', 'Solar Extension Cable 10 Awg', 'MISC/SHOP SUPPLIES', 'TORK', 'SEA-US', 0, 37.04, 55.56, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SEA-US' OR UPPER(description) = 'SOLAR EXTENSION CABLE 10 AWG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SEDM4-25', 'Sunexplorer Display', 'MISC/SHOP SUPPLIES', 'TORK', 'SEDM4-25', 0, 215.0, 430.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SEDM4-25' OR UPPER(description) = 'SUNEXPLORER DISPLAY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SFDP-030-055-42', 'Water Pump 42 Series Automatic Demand 3Gpm 55Psoi', 'MISC/SHOP SUPPLIES', 'TORK', 'SFDP-030-055-42', 0, 79.89, 111.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SFDP-030-055-42' OR UPPER(description) = 'WATER PUMP 42 SERIES AUTOMATIC DEMAND 3GPM 55PSOI');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SFDP1-030-055-42', 'Seaflo 42-Series Water Pressure Diaphragm Pump W/V', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 68.99, 96.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SFDP1-030-055-42' OR UPPER(description) = 'SEAFLO 42-SERIES WATER PRESSURE DIAPHRAGM PUMP W/V');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'sg-pxe12-25', 'Sungator 1/2" Elbow Pex Fittings', 'MISC/SHOP SUPPLIES', 'AMAZO', 'sg-pxe12-25', 0, 0.0, 1.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'sg-pxe12-25' OR UPPER(description) = 'SUNGATOR 1/2" ELBOW PEX FITTINGS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'shu050150050', 'Victron Smartshunt 500A', 'MISC/SHOP SUPPLIES', 'NTP', '', 2, 0.0, 177.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'shu050150050' OR UPPER(description) = 'VICTRON SMARTSHUNT 500A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SHU050150050', 'Victron Energy Smart Shunt', 'MISC/SHOP SUPPLIES', 'AMAZO', 'SHU050150050', 0, 130.7, 183.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SHU050150050' OR UPPER(description) = 'VICTRON ENERGY SMART SHUNT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SHU065150050', 'Victron Smart Plug', 'MISC/SHOP SUPPLIES', 'AMAZO', 'SHU065150050', 0, 111.35, 169.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SHU065150050' OR UPPER(description) = 'VICTRON SMART PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'sku # 166065', '11/32 Yellow Pine 4X8''', 'HARDWARE', 'TORK', 'sku # 166065', 0, 26.0, 52.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'sku # 166065' OR UPPER(description) = '11/32 YELLOW PINE 4X8''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SL04-13-US', 'Mc4 Cable Extension 3''', 'SOLAR', 'TORK', 'SL04-13-US', 0, 13.99, 27.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SL04-13-US' OR UPPER(description) = 'MC4 CABLE EXTENSION 3''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SL1430', 'Icon Skylight 34 X 18', 'MISC/SHOP SUPPLIES', 'TORK', 'SL1430', 0, 138.26, 207.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SL1430' OR UPPER(description) = 'ICON SKYLIGHT 34 X 18');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SN37FR', 'Snappad 8" Jack Stand Pad System', 'MISC/SHOP SUPPLIES', 'ETRAI', 'SN37FR', 0, 40.84, 69.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SN37FR' OR UPPER(description) = 'SNAPPAD 8" JACK STAND PAD SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SOLARWIRE', 'Extension Wire 10 Feet', 'MISC/SHOP SUPPLIES', 'ETRAI', 'SOLARWIRE', 0, 20.99, 33.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SOLARWIRE' OR UPPER(description) = 'EXTENSION WIRE 10 FEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SOLARY', 'Solar 1-3 Male Connector Adapter', 'MISC/SHOP SUPPLIES', 'TORK', 'SOLARY', 0, 18.89, 37.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SOLARY' OR UPPER(description) = 'SOLAR 1-3 MALE CONNECTOR ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SP-100W', 'Spartan Power 100 Watt Solar Panel', 'MISC/SHOP SUPPLIES', '.....', 'SP-100W', 0, 109.99, 153.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SP-100W' OR UPPER(description) = 'SPARTAN POWER 100 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SRM24', 'Interstate Group 24 Deep Cycle Battery', 'MISC/SHOP SUPPLIES', 'INTER', 'SRM24', 6, 104.29, 159.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SRM24' OR UPPER(description) = 'INTERSTATE GROUP 24 DEEP CYCLE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SRM-24', 'Interstate Battery', 'MISC/SHOP SUPPLIES', 'TORK', 'SRM-24', 0, 110.95, 155.33, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SRM-24' OR UPPER(description) = 'INTERSTATE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SRM-27', 'Interstate Lead Acid Battery', 'ELECTRICAL', 'TORK', 'SRM-27', 0, 112.75, 159.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SRM-27' OR UPPER(description) = 'INTERSTATE LEAD ACID BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SS026-42', '3/8-16 X Flange Nut Ss', 'MISC/SHOP SUPPLIES', 'TORK', 'SS026-42', 0, 0.55, 1.65, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SS026-42' OR UPPER(description) = '3/8-16 X FLANGE NUT SS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SS130-4234', '3/8 Ss X 1 1/4" Bolts', 'MISC/SHOP SUPPLIES', 'E&G', 'SS130-4234', 0, 2.07, 4.14, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SS130-4234' OR UPPER(description) = '3/8 SS X 1 1/4" BOLTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SS142-3832', '3/8 1" Ss Teks', 'HARDWARE', 'TORK', 'SS142-3832', 0, 0.36, 1.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SS142-3832' OR UPPER(description) = '3/8 1" SS TEKS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SSH-CB', 'Sink Sprayer Head For Kitchen', 'MISC/SHOP SUPPLIES', 'AMAZO', 'SSH-CB', 0, 9.99, 19.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SSH-CB' OR UPPER(description) = 'SINK SPRAYER HEAD FOR KITCHEN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SSRV3T', 'Soft Start By Network', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 1, 0.0, 488.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SSRV3T' OR UPPER(description) = 'SOFT START BY NETWORK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'STWH13145', 'Rv Slide Out Awning Fabric White', 'MISC/SHOP SUPPLIES', 'AMAZO', 'STWH13145', 0, 125.5, 175.7, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'STWH13145' OR UPPER(description) = 'RV SLIDE OUT AWNING FABRIC WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'SUNMAK16', 'Solar Panel Mounting Z Bracket 16 Pcs', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 35.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'SUNMAK16' OR UPPER(description) = 'SOLAR PANEL MOUNTING Z BRACKET 16 PCS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'T05-0782', 'Toilet Flange', 'MISC/SHOP SUPPLIES', '.....', 'T05-0782', 1, 20.46, 34.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'T05-0782' OR UPPER(description) = 'TOILET FLANGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'T1006', 'Valterra Spigot Flange', 'MISC/SHOP SUPPLIES', 'ETRAI', 'T1006', 0, 8.63, 17.26, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'T1006' OR UPPER(description) = 'VALTERRA SPIGOT FLANGE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'T18', 'Valterra San Tee Double Rotating Valve, Mess-Free', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 41.93, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'T18' OR UPPER(description) = 'VALTERRA SAN TEE DOUBLE ROTATING VALVE, MESS-FREE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TBZ-01', 'Tsinglax 120Pcs Copper Wire Lugs Awg2 4 6 8 10 12', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 23.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TBZ-01' OR UPPER(description) = 'TSINGLAX 120PCS COPPER WIRE LUGS AWG2 4 6 8 10 12');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TC72RB', '6 Ft Sleeve Cable With Tee Handle', 'MISC/SHOP SUPPLIES', '.....', 'TC72RB', 0, 43.23, 86.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TC72RB' OR UPPER(description) = '6 FT SLEEVE CABLE WITH TEE HANDLE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TH49FR', 'Thetford Rv Toilet White', 'MISC/SHOP SUPPLIES', '.....', 'TH49FR', 0, 194.59, 272.43, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TH49FR' OR UPPER(description) = 'THETFORD RV TOILET WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TICONN-244-NL200', 'Ticonn 200 Pcs Nylon Spade Quick Disconnect Connec', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 18.13, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TICONN-244-NL200' OR UPPER(description) = 'TICONN 200 PCS NYLON SPADE QUICK DISCONNECT CONNEC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TK-CWLT000188', 'Tkdmr 10Pcs 1/0 Awg-3/8" Battery Lugs,Heavy Duty W', 'ELECTRICAL', 'AMAZO', 'TKDMR', 0, 0.0, 46.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TK-CWLT000188' OR UPPER(description) = 'TKDMR 10PCS 1/0 AWG-3/8" BATTERY LUGS,HEAVY DUTY W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TKDMR', 'Awg 3/8" Battery Lugs Heavy Duty Wire', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 15.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TKDMR' OR UPPER(description) = 'AWG 3/8" BATTERY LUGS HEAVY DUTY WIRE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TMC10', 'Flat Metal Radius White 70 Ft', 'HARDWARE', 'TMC', 'TMC10', 0, 195.23, 370.94, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TMC10' OR UPPER(description) = 'FLAT METAL RADIUS WHITE 70 FT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'Tri-Fold Rivets-1', 'Kaking 3/16" X 1" Tri-Fold Rivets Assortment - 50P', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 18.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'Tri-Fold Rivets-1' OR UPPER(description) = 'KAKING 3/16" X 1" TRI-FOLD RIVETS ASSORTMENT - 50P');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'TVNIKD 1000', '1000 Watt Inverter', 'MISC/SHOP SUPPLIES', 'TORK', 'TVNIKD 1000', 0, 89.0, 178.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'TVNIKD 1000' OR UPPER(description) = '1000 WATT INVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'U-41G-1', 'Digest-It Holding Tank Treatment', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 59.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'U-41G-1' OR UPPER(description) = 'DIGEST-IT HOLDING TANK TREATMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UBK-3X1.75LB', 'U Bolt Zink Plated 3" Axle Kit', 'MISC/SHOP SUPPLIES', 'TORK', 'UBK-3X1.75LB', 0, 60.82, 121.64, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UBK-3X1.75LB' OR UPPER(description) = 'U BOLT ZINK PLATED 3" AXLE KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UC072LFA', 'Pex Female Adapter 1/2 To 1/2"', 'MISC/SHOP SUPPLIES', 'AMAZO', 'UC072LFA', 10, 3.99, 7.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UC072LFA' OR UPPER(description) = 'PEX FEMALE ADAPTER 1/2 TO 1/2"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UC526LFA10', 'Sharkbite1/2" X1/2" Fnpt Female Adapter', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 7, 0.0, 5.28, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UC526LFA10' OR UPPER(description) = 'SHARKBITE1/2" X1/2" FNPT FEMALE ADAPTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UC532LFA', 'Sharkbite 1/2 Female Swivel 90', 'MISC/SHOP SUPPLIES', 'TORK', 'UC532LFA', 0, 6.99, 13.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UC532LFA' OR UPPER(description) = 'SHARKBITE 1/2 FEMALE SWIVEL 90');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UC532LFZ', 'Swivel Female Adapter 1/2" X 1/2" Pex 90 Degree El', 'MISC/SHOP SUPPLIES', 'HDEPO', 'UC532LFZ', 0, 9.45, 18.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UC532LFZ' OR UPPER(description) = 'SWIVEL FEMALE ADAPTER 1/2" X 1/2" PEX 90 DEGREE EL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UG-Tallew-554', '3 Pieces 12V Usb Outlet Dual Usb Car Charger Socke', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 25.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UG-Tallew-554' OR UPPER(description) = '3 PIECES 12V USB OUTLET DUAL USB CAR CHARGER SOCKE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'UN2794', 'Group 27 Led Acid Battery', 'MISC/SHOP SUPPLIES', 'TORK', 'UN2794', 0, 129.99, 181.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'UN2794' OR UPPER(description) = 'GROUP 27 LED ACID BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'USED', 'Used Penguin Ii White Shroud', 'MISC/SHOP SUPPLIES', '.....', 'USED', 0, 50.0, 50.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'USED' OR UPPER(description) = 'USED PENGUIN II WHITE SHROUD');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000168112', 'Lippert Slide Room Topper - Drivers Side', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V000168112', 0, 597.0, 895.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000168112' OR UPPER(description) = 'LIPPERT SLIDE ROOM TOPPER - DRIVERS SIDE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000211487', 'Solera Black Awning Fabric 16''', 'MISC/SHOP SUPPLIES', 'TORK', 'V000211487', 0, 282.62, 395.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000211487' OR UPPER(description) = 'SOLERA BLACK AWNING FABRIC 16''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000314862', 'Solera 14'' Blk/Wht Awning Fabric', 'MISC/SHOP SUPPLIES', 'TORK', 'V000314862', 0, 273.95, 383.53, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000314862' OR UPPER(description) = 'SOLERA 14'' BLK/WHT AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V00033430', 'Black 19 Ft. Awning Fabric, Lippert', 'MISC/SHOP SUPPLIES', 'NTP', 'V00033430', 0, 345.88, 484.23, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V00033430' OR UPPER(description) = 'BLACK 19 FT. AWNING FABRIC, LIPPERT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000334377', 'Solera 14'' Black Solid Fabric', 'MISC/SHOP SUPPLIES', 'RICH', 'V000334377', 0, 193.79, 281.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000334377' OR UPPER(description) = 'SOLERA 14'' BLACK SOLID FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000334383', '15'' Solera Black/Wht Awning Fabric', 'MISC/SHOP SUPPLIES', 'LIP', 'V000334383', 0, 188.75, 273.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000334383' OR UPPER(description) = '15'' SOLERA BLACK/WHT AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000334387', 'Sand Solera Awning Fabric', 'MISC/SHOP SUPPLIES', '.....', 'V000334387', 0, 193.79, 281.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000334387' OR UPPER(description) = 'SAND SOLERA AWNING FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000334419', 'Solera Awning Fabric 18'' Black', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V000334419', 0, 218.26, 317.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000334419' OR UPPER(description) = 'SOLERA AWNING FABRIC 18'' BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000334448', 'Awning Fabric 21'' Blk Solid (Lippert)', 'MISC/SHOP SUPPLIES', 'LIP', 'V000334448', 0, 218.26, 317.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000334448' OR UPPER(description) = 'AWNING FABRIC 21'' BLK SOLID (LIPPERT)');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000362649', 'Solera Black Solid Awning Fabric 15''', 'MISC/SHOP SUPPLIES', 'LIP', 'V000362649', 0, 230.73, 461.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000362649' OR UPPER(description) = 'SOLERA BLACK SOLID AWNING FABRIC 15''');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000366974', 'Rv Entry Door - Polar White', 'MISC/SHOP SUPPLIES', 'LIP', 'V000366974', 0, 503.25, 699.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000366974' OR UPPER(description) = 'RV ENTRY DOOR - POLAR WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000437137', 'Slide Room Topper 85" Black Fabric', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V000437137', 0, 261.21, 365.69, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000437137' OR UPPER(description) = 'SLIDE ROOM TOPPER 85" BLACK FABRIC');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000438166', 'Solera 73" Slide Topper Black', 'MISC/SHOP SUPPLIES', 'LIP', 'V000438166', 0, 261.21, 444.06, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000438166' OR UPPER(description) = 'SOLERA 73" SLIDE TOPPER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000442075', '157" Slide Topper Black', 'MISC/SHOP SUPPLIES', 'LIP', 'V000442075', 0, 335.66, 570.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000442075' OR UPPER(description) = '157" SLIDE TOPPER BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000452890', 'Awning Arms 63'' Black Solara', 'MISC/SHOP SUPPLIES', 'TORK', 'V000452890', 0, 764.62, 1070.47, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000452890' OR UPPER(description) = 'AWNING ARMS 63'' BLACK SOLARA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000464942', 'Solera Awning Arms 69" W Speakers', 'MISC/SHOP SUPPLIES', 'RICH', 'V000464942', 0, 883.99, 1190.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000464942' OR UPPER(description) = 'SOLERA AWNING ARMS 69" W SPEAKERS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000465301', 'Lippert Slide Room H Rack', 'MISC/SHOP SUPPLIES', '.....', 'V000465301', 0, 1087.39, 1451.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000465301' OR UPPER(description) = 'LIPPERT SLIDE ROOM H RACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000505211', 'H Track Slide Room Lippert', 'MISC/SHOP SUPPLIES', '.....', 'V000505211', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000505211' OR UPPER(description) = 'H TRACK SLIDE ROOM LIPPERT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000813798', 'Schwintek Slide Room Kit Complete', 'MISC/SHOP SUPPLIES', 'TORK', 'V000813798', 0, 0.0, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000813798' OR UPPER(description) = 'SCHWINTEK SLIDE ROOM KIT COMPLETE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814828', 'Schwintek H-Column', 'MISC/SHOP SUPPLIES', 'TORK', 'V000814828', 0, 906.16, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814828' OR UPPER(description) = 'SCHWINTEK H-COLUMN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814854', 'Schwintek H Rack', 'MISC/SHOP SUPPLIES', 'LIP', 'V000814854', 0, 906.16, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814854' OR UPPER(description) = 'SCHWINTEK H RACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814886', 'Lippert H Rack System', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V000814886', 0, 906.16, 1268.62, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814886' OR UPPER(description) = 'LIPPERT H RACK SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814912', 'Lippert Slideout - Std 24 1/4 X 54 7/8 Hc45 Rh1 C-', 'MISC/SHOP SUPPLIES', 'LIP', 'V000814912', 0, 906.16, 1178.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814912' OR UPPER(description) = 'LIPPERT SLIDEOUT - STD 24 1/4 X 54 7/8 HC45 RH1 C-');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814944', 'Lippert Slideout H Track', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V000814944', 0, 906.16, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814944' OR UPPER(description) = 'LIPPERT SLIDEOUT H TRACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000814972', 'Schwintek Slideout System', 'MISC/SHOP SUPPLIES', 'TORK', 'V000814972', 0, 931.69, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000814972' OR UPPER(description) = 'SCHWINTEK SLIDEOUT SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000815051', 'Lippert Slide Room H Track System', 'MISC/SHOP SUPPLIES', 'CFREE', 'V000815051', 0, 906.16, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000815051' OR UPPER(description) = 'LIPPERT SLIDE ROOM H TRACK SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000815096', 'Schwintech Complete Rack System', 'MISC/SHOP SUPPLIES', 'TORK', 'V000815096', 0, 871.31, 1162.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000815096' OR UPPER(description) = 'SCHWINTECH COMPLETE RACK SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000815106', 'Slide Room Std 38X73 1/8 Hc63 Rh1', 'MISC/SHOP SUPPLIES', 'TORK', 'V000815106', 0, 906.16, 1321.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000815106' OR UPPER(description) = 'SLIDE ROOM STD 38X73 1/8 HC63 RH1');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V000832155', 'Lippert Slide Out', 'MISC/SHOP SUPPLIES', 'TORK', 'V000832155', 0, 0.0, 1209.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V000832155' OR UPPER(description) = 'LIPPERT SLIDE OUT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V00121048', 'Lippert Storage Compartment Door White', 'MISC/SHOP SUPPLIES', 'ADFAS', 'V00121048', 0, 396.54, 530.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V00121048' OR UPPER(description) = 'LIPPERT STORAGE COMPARTMENT DOOR WHITE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V004', 'Gutter Spouts', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V004', 0, 11.75, 23.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V004' OR UPPER(description) = 'GUTTER SPOUTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2049-55', 'Ventline Plastic Plumbing Vent', 'MISC/SHOP SUPPLIES', 'TORK', 'V2049-55', 0, 11.01, 22.02, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2049-55' OR UPPER(description) = 'VENTLINE PLASTIC PLUMBING VENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2092', 'Pre Owned Vent-Line', 'HVAC', '.....', 'V2092', 0, 32.56, 34.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2092' OR UPPER(description) = 'PRE OWNED VENT-LINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2092SP-28', 'Ventline Vent White Dome', 'HVAC', '.....', 'V2092SP-28', 0, 43.0, 73.1, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2092SP-28' OR UPPER(description) = 'VENTLINE VENT WHITE DOME');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2094', 'Roof Vent Replacement', 'MISC/SHOP SUPPLIES', 'ETRAI', 'V2094', 0, 40.54, 60.81, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2094' OR UPPER(description) = 'ROOF VENT REPLACEMENT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2094-603-00', 'Powered Roof Vent - Bath', 'MISC/SHOP SUPPLIES', 'TORK', 'V2094-603-00', 0, 75.69, 128.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2094-603-00' OR UPPER(description) = 'POWERED ROOF VENT - BATH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V2094SP-28', 'Ventline White Vent Complete', 'HVAC', 'TORK', 'V2094SP-28', 0, 40.54, 81.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V2094SP-28' OR UPPER(description) = 'VENTLINE WHITE VENT COMPLETE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'V6B', '6" Ventline Power Vent Lid Only', 'MISC/SHOP SUPPLIES', 'TORK', 'V6B', 0, 12.29, 24.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'V6B' OR UPPER(description) = '6" VENTLINE POWER VENT LID ONLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'VICTRON 150/35', 'Mppt Victron Blue Solar Controller', 'MISC/SHOP SUPPLIES', 'TORK', 'VICTRON 150/35', 0, 0.0, 372.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'VICTRON 150/35' OR UPPER(description) = 'MPPT VICTRON BLUE SOLAR CONTROLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'VP543', 'Dometic Round Bathroom Vent Fan', 'MISC/SHOP SUPPLIES', 'AMAZO', 'VP543', 0, 74.45, 148.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'VP543' OR UPPER(description) = 'DOMETIC ROUND BATHROOM VENT FAN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'VR34575W', '39 Gallon 57" X 34" X 5" Fresh Water Tank', 'MISC/SHOP SUPPLIES', 'ETRAI', 'VR34575W', 0, 247.46, 371.19, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'VR34575W' OR UPPER(description) = '39 GALLON 57" X 34" X 5" FRESH WATER TANK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'VV616-EA', 'Multi-Vehicle High Temperature Red Grease', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 41.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'VV616-EA' OR UPPER(description) = 'MULTI-VEHICLE HIGH TEMPERATURE RED GREASE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'W1000', '4X8 Lauan 1/8 Sheet', 'MISC/SHOP SUPPLIES', 'TORK', 'W1000', 0, 37.68, 56.52, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'W1000' OR UPPER(description) = '4X8 LAUAN 1/8 SHEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'W5214', '5/16 Gromet', 'HARDWARE', 'TORK', 'W5214', 0, 1.79, 5.37, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'W5214' OR UPPER(description) = '5/16 GROMET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WCP-USBAC-B', 'Wall Mount Usb-C & Usb-A Charging Port', 'MISC/SHOP SUPPLIES', '.....', 'WCP-USBAC-B', 0, 26.5, 39.75, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WCP-USBAC-B' OR UPPER(description) = 'WALL MOUNT USB-C & USB-A CHARGING PORT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WD4989', 'Caulking Guns, 400Ml/13.5Fl Oz Dual Componen', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 30.74, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WD4989' OR UPPER(description) = 'CAULKING GUNS, 400ML/13.5FL OZ DUAL COMPONEN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WDR15WT', 'Valterra Diamond White Outlet', 'MISC/SHOP SUPPLIES', 'AMAZO', 'WDR15WT', 0, 15.73, 31.46, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WDR15WT' OR UPPER(description) = 'VALTERRA DIAMOND WHITE OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-5110RS', 'Wfco Used Inverter 1000 Watt Pure Sine', 'MISC/SHOP SUPPLIES', '.....', 'WF-5110RS', 0, 607.67, 304.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-5110RS' OR UPPER(description) = 'WFCO USED INVERTER 1000 WATT PURE SINE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-8735-AD', 'Converter Charger  30 Amp', 'MISC/SHOP SUPPLIES', '.....', 'WF-8735-AD', 0, 149.14, 208.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-8735-AD' OR UPPER(description) = 'CONVERTER CHARGER  30 AMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-8945LIS-MBA', 'Wfco Wf-8955Lis-Mba Main Board Assembly For Wf-890', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 242.56, 344.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-8945LIS-MBA' OR UPPER(description) = 'WFCO WF-8955LIS-MBA MAIN BOARD ASSEMBLY FOR WF-890');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF8955LIS-MBA', 'Converter/Charger - Main', 'MISC/SHOP SUPPLIES', 'AMAZO', 'WF-8955LIS-MBA', 5, 0.0, 275.76, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF8955LIS-MBA' OR UPPER(description) = 'CONVERTER/CHARGER - MAIN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-8955LIS-MBA', 'Wfco Lithium Converter', 'MISC/SHOP SUPPLIES', 'TORK', 'WF-8955LIS-MBA', 0, 246.07, 344.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-8955LIS-MBA' OR UPPER(description) = 'WFCO LITHIUM CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-8955-MBA', 'Power Converter 3 Stage For Lithium', 'MISC/SHOP SUPPLIES', 'TORK', 'WF-8955-MBA', 1, 79.99, 159.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-8955-MBA' OR UPPER(description) = 'POWER CONVERTER 3 STAGE FOR LITHIUM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-8955-MBA LIS', '55 Amp Wifco Lis Converter', 'MISC/SHOP SUPPLIES', 'TORK', 'WF-8955-MBA LIS', 0, 181.65, 254.31, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-8955-MBA LIS' OR UPPER(description) = '55 AMP WIFCO LIS CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-9855', '55 Amp Lithium Power Converter', 'MISC/SHOP SUPPLIES', 'TORK', 'WF-9855', 0, 143.0, 200.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-9855' OR UPPER(description) = '55 AMP LITHIUM POWER CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-9855-AD-CB', 'Wf-9855 Converter/Charger 55 Amp', 'MISC/SHOP SUPPLIES', 'TORK', 'WF-9855-AD-CB', 0, 168.0, 235.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-9855-AD-CB' OR UPPER(description) = 'WF-9855 CONVERTER/CHARGER 55 AMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-9855-LIS', 'Wfco Wf-9855-Lis Deck Mount Converter/Charger With', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 328.71, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-9855-LIS' OR UPPER(description) = 'WFCO WF-9855-LIS DECK MOUNT CONVERTER/CHARGER WITH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WF-9875-AD', '75 Amp Power Converter', 'MISC/SHOP SUPPLIES', '.....', 'WF-9875-AD', 0, 89.99, 256.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WF-9875-AD' OR UPPER(description) = '75 AMP POWER CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WFCO8900 MBA', '55 Amp Converter', 'MISC/SHOP SUPPLIES', 'TORK', 'WFCO8900 MBA', 0, 0.0, 179.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WFCO8900 MBA' OR UPPER(description) = '55 AMP CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WFCO8945', '45 Amp Converter 8945', 'MISC/SHOP SUPPLIES', 'ETRAI', 'WFCO8945', 0, 87.95, 175.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WFCO8945' OR UPPER(description) = '45 AMP CONVERTER 8945');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WFCO8950LP', 'Wfco Lower Converter Unit 50 Amp', 'MISC/SHOP SUPPLIES', 'TLR W', 'WFCO8950LP', 0, 176.0, 246.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WFCO8950LP' OR UPPER(description) = 'WFCO LOWER CONVERTER UNIT 50 AMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WFCO-8955-LIS', 'Pec-Lis Converter', 'MISC/SHOP SUPPLIES', 'LIPPE', 'WFCO-8955-LIS', 0, 0.0, 379.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WFCO-8955-LIS' OR UPPER(description) = 'PEC-LIS CONVERTER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WH-6GEA', 'Dometic 6 Gallon Water Heater', 'MISC/SHOP SUPPLIES', 'AMAZO', '94002SP', 0, 0.0, 665.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WH-6GEA' OR UPPER(description) = 'DOMETIC 6 GALLON WATER HEATER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'W-H-ASY', 'Used Water Heater Assembly', 'MISC/SHOP SUPPLIES', 'TORK', '161255', 0, 0.0, 65.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'W-H-ASY' OR UPPER(description) = 'USED WATER HEATER ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WIR1001-DX', 'Wire Harness Assembly 25'' 8-2 Uv Wire W 8 Gage Rng', 'MISC/SHOP SUPPLIES', 'GOPOW', '', 0, 68.25, 95.55, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WIR1001-DX' OR UPPER(description) = 'WIRE HARNESS ASSEMBLY 25'' 8-2 UV WIRE W 8 GAGE RNG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WIR1018', 'Harness, 8-2, Ring Cons, Cc Battery', 'MISC/SHOP SUPPLIES', 'GOPOW', '', 1, 0.0, 60.2, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WIR1018' OR UPPER(description) = 'HARNESS, 8-2, RING CONS, CC BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'WVSXP43', 'Voyager Wireless Camera System', 'MISC/SHOP SUPPLIES', 'TORK', 'WVSXP43', 0, 323.3, 484.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'WVSXP43' OR UPPER(description) = 'VOYAGER WIRELESS CAMERA SYSTEM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X000JLIGF', 'Hdmi Extender', 'MISC/SHOP SUPPLIES', 'ETRAI', 'X000JLIGF', 0, 17.99, 35.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X000JLIGF' OR UPPER(description) = 'HDMI EXTENDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X000MUS49N', 'Led Light Kit 12V.', 'MISC/SHOP SUPPLIES', 'TORK', 'X000MUS49N', 0, 0.0, 26.89, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X000MUS49N' OR UPPER(description) = 'LED LIGHT KIT 12V.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X001GDCWSH', '6 Ga Welding Cable 20 Feet', 'MISC/SHOP SUPPLIES', 'TORK', 'X001GDCWSH', 0, 30.48, 45.72, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X001GDCWSH' OR UPPER(description) = '6 GA WELDING CABLE 20 FEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x0020smjt1', 'Plastic Grab Handle Entry Door', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 19.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x0020smjt1' OR UPPER(description) = 'PLASTIC GRAB HANDLE ENTRY DOOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0022UYEMR', 'Wathai Cooling Case Fan', 'MISC/SHOP SUPPLIES', 'TORK', 'X0022UYEMR', 0, 14.89, 29.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0022UYEMR' OR UPPER(description) = 'WATHAI COOLING CASE FAN');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0023E9DKZ', '400 Amp Master Cutoff Switch', 'MISC/SHOP SUPPLIES', 'LIPPE', 'X0023E9DKZ', 0, 0.0, 142.79, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0023E9DKZ' OR UPPER(description) = '400 AMP MASTER CUTOFF SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x0023e9dkz', 'Ampper Battery Switch', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 0.0, 77.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x0023e9dkz' OR UPPER(description) = 'AMPPER BATTERY SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x002e4nta9', 'Bus Bar 4 Post Power Distribution-Solar Wiring', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 3, 0.0, 50.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x002e4nta9' OR UPPER(description) = 'BUS BAR 4 POST POWER DISTRIBUTION-SOLAR WIRING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002E8ZE0X', 'Pex 1/2 Brass Elbows', 'MISC/SHOP SUPPLIES', 'AMAZO', 'SG-PXE12-25', 25, 0.0, 5.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002E8ZE0X' OR UPPER(description) = 'PEX 1/2 BRASS ELBOWS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x002etp81h', 'Ntp To Clamp Fitting', 'PLUMBING', 'TORK', 'x002etp81h', 0, 8.49, 16.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x002etp81h' OR UPPER(description) = 'NTP TO CLAMP FITTING');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x002gfp9ef', '1/2" P-Fittings 90*', 'PLUMBING', 'AMAZO', 'x002gfp9ef', 0, 2.39, 7.17, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x002gfp9ef' OR UPPER(description) = '1/2" P-FITTINGS 90*');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x002l4kgot', 'Black Latch It Rv Door Lock Assembly', 'MISC/SHOP SUPPLIES', 'AMAZO', 'x002l4kgot', 0, 38.99, 77.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x002l4kgot' OR UPPER(description) = 'BLACK LATCH IT RV DOOR LOCK ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002L4KGOT', 'Black Rv Door Latch', 'MISC/SHOP SUPPLIES', 'TORK', 'X002L4KGOT', 0, 38.99, 54.59, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002L4KGOT' OR UPPER(description) = 'BLACK RV DOOR LATCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002O7PXEB', 'Drawer Slides', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 41.8, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002O7PXEB' OR UPPER(description) = 'DRAWER SLIDES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002VVIETB', 'Battery Switch 12-48 V 600Mp Battery Power Cutoff', 'MISC/SHOP SUPPLIES', 'LIPPE', '', 0, 0.0, 55.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002VVIETB' OR UPPER(description) = 'BATTERY SWITCH 12-48 V 600MP BATTERY POWER CUTOFF');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002XU3XC3', 'Toilett Valve', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 49.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002XU3XC3' OR UPPER(description) = 'TOILETT VALVE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X002Z8Z58N', 'Thermal Cutoff', 'MISC/SHOP SUPPLIES', 'TORK', 'X002Z8Z58N', 0, 0.0, 15.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X002Z8Z58N' OR UPPER(description) = 'THERMAL CUTOFF');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X00317B1CL', 'Usb Extension Cable 3.0', 'MISC/SHOP SUPPLIES', 'TORK', 'X00317B1CL', 0, 19.99, 29.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X00317B1CL' OR UPPER(description) = 'USB EXTENSION CABLE 3.0');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0032DBYAX', 'A/S Grabber Catches', 'MISC/SHOP SUPPLIES', 'TORK', 'X0032DBYAX', 0, 3.89, 11.67, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0032DBYAX' OR UPPER(description) = 'A/S GRABBER CATCHES');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0038B8ZWT', 'Cat 8 Ethernet Cable 25 Ft.', 'MISC/SHOP SUPPLIES', 'AMAZO', 'X0038B8ZWT', 0, 36.78, 51.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0038B8ZWT' OR UPPER(description) = 'CAT 8 ETHERNET CABLE 25 FT.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x0038yvf5f', 'Terminal Studs 12 Volt Power Dist Block', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 59.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x0038yvf5f' OR UPPER(description) = 'TERMINAL STUDS 12 VOLT POWER DIST BLOCK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x003ay23ft', 'Breakaway Switch', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 1, 11.99, 24.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x003ay23ft' OR UPPER(description) = 'BREAKAWAY SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003BLGOID', 'Victron Digital Multi Control 200/200A', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 0, 0.0, 192.78, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003BLGOID' OR UPPER(description) = 'VICTRON DIGITAL MULTI CONTROL 200/200A');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003C6XIIL', '#33081 Furnace Sail Switch', 'MISC/SHOP SUPPLIES', 'TORK', 'X003C6XIIL', 0, 22.54, 45.08, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003C6XIIL' OR UPPER(description) = '#33081 FURNACE SAIL SWITCH');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003D3MAE1', 'Mc4 Solar Panel Extension Wire 5 Feet', 'MISC/SHOP SUPPLIES', 'TORK', 'X003D3MAE1', 0, 9.99, 14.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003D3MAE1' OR UPPER(description) = 'MC4 SOLAR PANEL EXTENSION WIRE 5 FEET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003EYA7A3', 'Rvlovent 12V.Vent Fan W/Remote', 'HVAC', 'TORK', 'X003EYA7A3', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003EYA7A3' OR UPPER(description) = 'RVLOVENT 12V.VENT FAN W/REMOTE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x003kxxbdn', 'Victron Mppt 100/30 Smart Charge Controller', 'MISC/SHOP SUPPLIES', 'TORK', 'x003kxxbdn', 0, 211.66, 296.32, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x003kxxbdn' OR UPPER(description) = 'VICTRON MPPT 100/30 SMART CHARGE CONTROLLER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003QKU5GL', 'Propane Hose Stainless 15"', 'MISC/SHOP SUPPLIES', '.....', 'GCH043-USF', 0, 18.99, 37.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003QKU5GL' OR UPPER(description) = 'PROPANE HOSE STAINLESS 15"');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003QXDR4Z', 'Entry Door Loch Hardware', 'MISC/SHOP SUPPLIES', 'TORK', 'X003QXDR4Z', 0, 20.0, 28.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003QXDR4Z' OR UPPER(description) = 'ENTRY DOOR LOCH HARDWARE');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003TGBJMV', '12 Voly Usb And Usb-C Outlet', 'MISC/SHOP SUPPLIES', 'AMAZO', 'X003TGBJMV', 0, 19.99, 27.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003TGBJMV' OR UPPER(description) = '12 VOLY USB AND USB-C OUTLET');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003TMXHZH', 'Double Row Terminal Block Ac 6 Ga', 'MISC/SHOP SUPPLIES', 'TORK', 'X003TMXHZH', 0, 8.99, 13.49, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003TMXHZH' OR UPPER(description) = 'DOUBLE ROW TERMINAL BLOCK AC 6 GA');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003W', '3/8 Window Bead For Window Re-Seal', 'MISC/SHOP SUPPLIES', 'TORK', 'X003W', 0, 8.0, 15.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003W' OR UPPER(description) = '3/8 WINDOW BEAD FOR WINDOW RE-SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'x003ycf4y9', 'Nitrile Lip 57X85X10 Mm Wheel Seal', 'MISC/SHOP SUPPLIES', 'TORK', 'x003ycf4y9', 0, 7.99, 23.97, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'x003ycf4y9' OR UPPER(description) = 'NITRILE LIP 57X85X10 MM WHEEL SEAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X003YRNABN', 'Attwood Water Heater Thermal', 'MISC/SHOP SUPPLIES', 'RICH', '', 0, 0.0, 0.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X003YRNABN' OR UPPER(description) = 'ATTWOOD WATER HEATER THERMAL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0040QQ2F3', '1" Vynal Insert Screw Cover', 'MISC/SHOP SUPPLIES', 'TORK', 'X0040QQ2F3', 0, 1.22, 2.01, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0040QQ2F3' OR UPPER(description) = '1" VYNAL INSERT SCREW COVER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0041WP9J1', 'Bussman Hmeg Super Fuse Holder', 'MISC/SHOP SUPPLIES', 'ETRAI', 'X0041WP9J1', 0, 15.52, 31.04, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0041WP9J1' OR UPPER(description) = 'BUSSMAN HMEG SUPER FUSE HOLDER');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X00459C6HD', 'Usb Charge Port 12V.  800 W', 'ELECTRICAL', 'AMAZO', 'A74-BG-CHARGER-FBA', 2, 11.99, 23.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X00459C6HD' OR UPPER(description) = 'USB CHARGE PORT 12V.  800 W');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0046ZTTP3', 'Mega Fuse 600 Amp', 'MISC/SHOP SUPPLIES', 'ETRAI', 'X0046ZTTP3', 0, 10.25, 20.5, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0046ZTTP3' OR UPPER(description) = 'MEGA FUSE 600 AMP');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0047FN7F5', '3/8 " Well Nut For Tank Sensor', 'MISC/SHOP SUPPLIES', 'TORK', 'X0047FN7F5', 0, 1.29, 3.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0047FN7F5' OR UPPER(description) = '3/8 " WELL NUT FOR TANK SENSOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X0047Q0IMT', 'Energeaster 10 Feet 10 Awg Solar Extension', 'MISC/SHOP SUPPLIES', 'TORK', 'X0047Q0IMT', 0, 20.24, 30.36, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X0047Q0IMT' OR UPPER(description) = 'ENERGEASTER 10 FEET 10 AWG SOLAR EXTENSION');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X004A1747D', 'Sky Light Assembly', 'MISC/SHOP SUPPLIES', 'TORK', 'X004A1747D', 0, 114.99, 160.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X004A1747D' OR UPPER(description) = 'SKY LIGHT ASSEMBLY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X10X1RHT2', 'Tek Screw Square Drive Pan - Black', 'MISC/SHOP SUPPLIES', 'TORK', 'X10X1RHT2', 0, 0.27, 0.4, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X10X1RHT2' OR UPPER(description) = 'TEK SCREW SQUARE DRIVE PAN - BLACK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X8000', 'Receiver Hitch Or Airstream', 'MISC/SHOP SUPPLIES', 'TORK', 'X8000', 0, 319.91, 447.87, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X8000' OR UPPER(description) = 'RECEIVER HITCH OR AIRSTREAM');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'X8001', 'Tork Lift Ecohitch Wide Body', 'MISC/SHOP SUPPLIES', 'TORK', 'X8001', 0, 309.99, 422.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'X8001' OR UPPER(description) = 'TORK LIFT ECOHITCH WIDE BODY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'XL-WVK01-WH', 'New Durable Plastic Water Valve Kit 385311641 For', 'MISC/SHOP SUPPLIES', 'AMAZN', '', 0, 0.0, 18.16, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'XL-WVK01-WH' OR UPPER(description) = 'NEW DURABLE PLASTIC WATER VALVE KIT 385311641 FOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'XMWHS34-1', 'Heat Shrink Multi-Wall 4''Stk 3/4" Id, Red', 'MISC/SHOP SUPPLIES', 'RAM', '', 0, 0.0, 68.44, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'XMWHS34-1' OR UPPER(description) = 'HEAT SHRINK MULTI-WALL 4''STK 3/4" ID, RED');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'XOO1XT6CK5', 'Clamps', 'HARDWARE', 'TORK', 'XOO1XT6CK5', 0, 3.29, 4.77, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'XOO1XT6CK5' OR UPPER(description) = 'CLAMPS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'XPF81Q10-50', 'Robertson Screws #8/1X1" Metal Pan Head 100 Ct', 'MISC/SHOP SUPPLIES', 'RECPR', 'XPF81Q10-50', 0, 9.95, 14.95, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'XPF81Q10-50' OR UPPER(description) = 'ROBERTSON SCREWS #8/1X1" METAL PAN HEAD 100 CT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'YBT-LSX-50A-C', 'Rkurck 12V 50A Circuit Breaker Automatic Reset For', 'MISC/SHOP SUPPLIES', 'AMAZO', '', 2, 0.0, 13.85, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'YBT-LSX-50A-C' OR UPPER(description) = 'RKURCK 12V 50A CIRCUIT BREAKER AUTOMATIC RESET FOR');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'YIZBAP', '1/2-20 Chrome Lug Nuts', 'MISC/SHOP SUPPLIES', '.....', 'YIZBAP', 0, 2.19, 3.39, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'YIZBAP' OR UPPER(description) = '1/2-20 CHROME LUG NUTS');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ysn-pcc-rv', 'Flame King Lp Tank Cover Dual 20 Lb.', 'MISC/SHOP SUPPLIES', 'TORK', 'ysn-pcc-rv', 0, 38.49, 61.58, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ysn-pcc-rv' OR UPPER(description) = 'FLAME KING LP TANK COVER DUAL 20 LB.');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'YTX20HL-BS', 'Motorcycle Battery', 'ELECTRICAL', 'AMAZO', '', 0, 0.0, 76.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'YTX20HL-BS' OR UPPER(description) = 'MOTORCYCLE BATTERY');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'YYC003-BF', 'Heavy Duty 7 Way Trailer Connector Plug', 'MISC/SHOP SUPPLIES', 'RENOG', 'YYC003-BF', 0, 33.99, 67.98, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'YYC003-BF' OR UPPER(description) = 'HEAVY DUTY 7 WAY TRAILER CONNECTOR PLUG');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZS-2B-CAP', 'Retail 2-Port Low Profile Roof Cap Blk', 'MISC/SHOP SUPPLIES', 'GOPOW', '', 0, 0.0, 39.9, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZS-2B-CAP' OR UPPER(description) = 'RETAIL 2-PORT LOW PROFILE ROOF CAP BLK');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZSK1006', 'Obsidian 100 Watt Solar Panel W/ Install Kit', 'MISC/SHOP SUPPLIES', 'GOPOW', 'ZSK1006', 0, 389.0, 389.0, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZSK1006' OR UPPER(description) = 'OBSIDIAN 100 WATT SOLAR PANEL W/ INSTALL KIT');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZSK1007', '100 Watt Solar Panel', 'MISC/SHOP SUPPLIES', 'GOPOW', 'ZSK1007', 0, 0.0, 479.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZSK1007' OR UPPER(description) = '100 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZSK1008', 'Airstream Zamp Obsidian 90 Watt Solar Panel', 'MISC/SHOP SUPPLIES', '.....', 'ZSK1008', 0, 209.99, 293.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZSK1008' OR UPPER(description) = 'AIRSTREAM ZAMP OBSIDIAN 90 WATT SOLAR PANEL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZSK1009', 'Solar Panel Kit Double Expansion 90 Watt Legacy Sl', 'MISC/SHOP SUPPLIES', 'GOPOW', 'ZSK1009', 0, 599.0, 838.6, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZSK1009' OR UPPER(description) = 'SOLAR PANEL KIT DOUBLE EXPANSION 90 WATT LEGACY SL');

INSERT INTO inventory (part_number, description, category, vendor, vendor_part_number, qty_on_hand, cost_each, sale_price_each, reorder_level, created_at, updated_at)
SELECT 'ZS-RV-Y', 'Zamp Solar Connector', 'MISC/SHOP SUPPLIES', 'GOPOW', 'ZS-RV-Y', 0, 0.0, 12.99, 0, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM inventory WHERE part_number = 'ZS-RV-Y' OR UPPER(description) = 'ZAMP SOLAR CONNECTOR');

COMMIT;

-- Items included: 1641
-- Items deleted per request: 4
-- Check after import:
-- SELECT COUNT(*) FROM inventory;
-- SELECT category, COUNT(*) FROM inventory GROUP BY category ORDER BY category;