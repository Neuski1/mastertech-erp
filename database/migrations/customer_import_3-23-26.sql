-- ============================================================
-- Customer import: CUSTOMER_INFORMATION_3-23-26.xlsx
-- Safe insert: skips any customer already matched by
--   last_name+first_name  OR  email_primary
-- Run against: mastertech_erp database
-- ============================================================

BEGIN;

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'ODELL', '', '', '', '', '', 'bpbaqwell@gmail.com', '(720) 635-5669', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ODELL' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'bpbaqwell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'ORCULT', '', '', '', '', '', 'michaelorcult1987@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ORCULT' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'michaelorcult1987@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'PARHAM', '', '', '', '', '', 'drparham@wellnessrhythms.com', '(303) 570-9448', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PARHAM' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'drparham@wellnessrhythms.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lexie', 'PARKER', '', '', '', '', '', 'lexie@iwpfo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PARKER' AND UPPER(first_name) = 'LEXIE') OR LOWER(email_primary) = 'lexie@iwpfo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Keri', 'PROPST', '', '', '', '', '', 'keripropst@gmail.com', '(970) 580-0611', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PROPST' AND UPPER(first_name) = 'KERI') OR LOWER(email_primary) = 'keripropst@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'RAY', '', '', '', '', '', 'sdana576@comcast.net', '(303) 946-5393', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAY' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'sdana576@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'REID', '', '', '', '', '', 'steverichardreid@gmail.com', '(720) 224-3608', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REID' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'steverichardreid@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Idalia', 'REYES', '', '', '', '', '', 'reyesidalia19@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REYES' AND UPPER(first_name) = 'IDALIA') OR LOWER(email_primary) = 'reyesidalia19@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'REYNOLDS', '', '', '', '', '', 'reinfold@aol.com', '(303) 901-2735', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REYNOLDS' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'reinfold@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Wendy', 'RICHARD', '', '', '', '', '', 'bergentownhouse@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICHARD' AND UPPER(first_name) = 'WENDY') OR LOWER(email_primary) = 'bergentownhouse@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Yegge', 'RICHARD', '', '', '', '', '', 'weswlker3704@gmail.com', '(406) 363-8556', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICHARD' AND UPPER(first_name) = 'YEGGE') OR LOWER(email_primary) = 'weswlker3704@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'NOLAN', '', '', '', '', '', 'justin.nolan86@gmail.com', '(303) 587-2877', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NOLAN' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'justin.nolan86@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sean', 'MCGUIGAN', '', '', '', '', '', 'seanmcguigan82@googlemail.com', '', 'RV TYPE= AS FLYING CLOUD | HE UNSUBSCRIBED', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCGUIGAN' AND UPPER(first_name) = 'SEAN') OR LOWER(email_primary) = 'seanmcguigan82@googlemail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'MCINTYRE', '', '', '', '', '', 'dmame@outlook.com', '(406) 461-0045', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCINTYRE' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'dmame@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aaron', 'MELL', '', '', '', '', '', 'adog_22@msn.com', '(303) 523-9459', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MELL' AND UPPER(first_name) = 'AARON') OR LOWER(email_primary) = 'adog_22@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Howard', 'METZ', '', '', '', '', '', 'howiemetz@gmail.com', '(303) 913-7334', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'METZ' AND UPPER(first_name) = 'HOWARD') OR LOWER(email_primary) = 'howiemetz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Todd', 'MICKLE', '', '', '', '', '', 'todd-mickle@yahoo.com', '(303) 478-8673', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MICKLE' AND UPPER(first_name) = 'TODD') OR LOWER(email_primary) = 'todd-mickle@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'MIHALCO', '', '', '', '', '', 'rick.mihalco@gmail.com', '(303) 931-6028', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MIHALCO' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'rick.mihalco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joseph-Kristi', 'MIKALAJUNAS', '', '', '', '', '', 'mikalajunasjoe@hotmail.com', '(813) 334-6252', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MIKALAJUNAS' AND UPPER(first_name) = 'JOSEPH-KRISTI') OR LOWER(email_primary) = 'mikalajunasjoe@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amy', 'MOREE', '', '', '', '', '', 'amymoree@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOREE' AND UPPER(first_name) = 'AMY') OR LOWER(email_primary) = 'amymoree@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Donald', 'MORROW', '', '', '', '', '', 'treemor83@comcast.net', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORROW' AND UPPER(first_name) = 'DONALD') OR LOWER(email_primary) = 'treemor83@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'MUNDY', '', '', '', '', '', 'mpmrecreation@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MUNDY' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'mpmrecreation@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'NEEPER', '', '', '', '', '', 'lisaneeper1@gmail.com', '(303) 725-0521', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NEEPER' AND UPPER(first_name) = 'LISA') OR LOWER(email_primary) = 'lisaneeper1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Todd', 'STORY', '', '10158 GREENFIELD CIRCLE', 'Parker', 'CO', '', 'toddrstory@comcast.net', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STORY' AND UPPER(first_name) = 'TODD') OR LOWER(email_primary) = 'toddrstory@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'SUTTON', '', '', '', '', '', 'mattsutton415@gmail.com', '(510) 502-7325', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SUTTON' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'mattsutton415@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'SWARTZ', '', '', '', '', '', 'steamboatswartz@gmail.com', '(970) 846-4442', 'RV TYPE= CROSSFIT 22C', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SWARTZ' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'steamboatswartz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jacob', 'TALBOT', '', '', '', '', '', 'jtalbut@zillow.com', '(805) 816-5844', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TALBOT' AND UPPER(first_name) = 'JACOB') OR LOWER(email_primary) = 'jtalbut@zillow.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'TUCKER', '', '', '', '', '', 'orangetrush@hotmail.com', '(303) 803-8274', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TUCKER' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'orangetrush@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'WALL', '', '', '', '', '', 'kw55@iwpfo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WALL' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kw55@iwpfo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'WALLACE', '', '', '', '', '', 'brian.wallace@denvergov.org', '(303) 507-5765', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WALLACE' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brian.wallace@denvergov.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anwar', 'WARFORD', '', '', '', '', '', 'chieftracks@yahoo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WARFORD' AND UPPER(first_name) = 'ANWAR') OR LOWER(email_primary) = 'chieftracks@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'WEISBROD', '', '', '', '', '', 'gregweisbrod@aol.com', '(720) 219-2834', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEISBROD' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gregweisbrod@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'WILLIAMS', '', '', '', '', '', 'jimewill99@hotmail.com', '(303) 249-3086', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jimewill99@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Hollis', 'WILSON', '', '', '', '', '', 'howilson7@msn.com', '(303) 229-3882', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILSON' AND UPPER(first_name) = 'HOLLIS') OR LOWER(email_primary) = 'howilson7@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'STINGLEY', '', '3149 WYANDOT ST.', 'Denver', 'CO', '', 'sfstingley@me.com', '(718) 331-1580', 'RV TYPE= AS BAMBI 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STINGLEY' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'sfstingley@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris & Kym', 'RICKS', '', '', '', '', '', 'elkriverhaymaker@zirkel.us', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICKS' AND UPPER(first_name) = 'CHRIS & KYM') OR LOWER(email_primary) = 'elkriverhaymaker@zirkel.us');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'ROSSTERY', '', '', '', '', '', 'kelly_rosstery@hotmail.com', '(907) 317-6223', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROSSTERY' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'kelly_rosstery@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maryanne', 'ROTHE', '', '', '', '', '', 'rothemaryanne@gmail.com', '(970) 380-3345', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROTHE' AND UPPER(first_name) = 'MARYANNE') OR LOWER(email_primary) = 'rothemaryanne@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Arthur', 'SANDERSEN', '', '', '', '', '', 'arthursandersenjr@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDERSEN' AND UPPER(first_name) = 'ARTHUR') OR LOWER(email_primary) = 'arthursandersenjr@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'SELCKE', '', '', '', '', '', 'mjselcke@gmail.com', '(720) 341-0750', 'RV TYPE= JAYCO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SELCKE' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'mjselcke@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'SENNHOLZ', '', '', '', '', '', 'realsenn@gmail.com', '(303) 744-3100', 'RV TYPE= R-POD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SENNHOLZ' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'realsenn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'SEXTON', '', '', '', '', '', 'bobsexton82@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SEXTON' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'bobsexton82@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'SHORT', '', '', '', '', '', 'mshort2018@gmail.com', '(720) 334-1002', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHORT' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mshort2018@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Susan', 'SMITH', '', '', '', '', '', 'picketfence88@gmail.com', '(720) 340-9382', 'RV TYPE= AS GLOBETROTTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'SUSAN') OR LOWER(email_primary) = 'picketfence88@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'SMURLD', '', '12410 GRAINWOOD WAY', 'San Diego', 'CA', '', '', '(858) 735-4986', 'RV TYPE= FR APEX ULTRA LIGHT 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMURLD' AND UPPER(first_name) = 'RICK'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trevor', 'STEINMARK', '', '', '', '', '', 'nuhskersfan870@gmail.com', '(303) 619-3643', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEINMARK' AND UPPER(first_name) = 'TREVOR') OR LOWER(email_primary) = 'nuhskersfan870@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'MCDANIEL', '', '', '', '', '', 'gary.mcdaniel45@gmail.com', '(303) 887-8608', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCDANIEL' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'gary.mcdaniel45@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michelle', 'HERMOSSILLO', '', '', '', '', '', 'hermosgmichelle@gmail.com', '(720) 607-0418', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HERMOSSILLO' AND UPPER(first_name) = 'MICHELLE') OR LOWER(email_primary) = 'hermosgmichelle@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob-Virginia', 'HEYKOOP', '', '', '', '', '', 'rwheykoop@gmail.com', '(303) 921-9767', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HEYKOOP' AND UPPER(first_name) = 'BOB-VIRGINIA') OR LOWER(email_primary) = 'rwheykoop@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chad', 'HICKMAN', '', '', '', '', '', 'kaitlynpepper95@gmail.com', '(720) 550-1357', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HICKMAN' AND UPPER(first_name) = 'CHAD') OR LOWER(email_primary) = 'kaitlynpepper95@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maxwell', 'HILL', '', '', '', '', '', 'ingehill@gmail.com', '(970) 390-7622', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HILL' AND UPPER(first_name) = 'MAXWELL') OR LOWER(email_primary) = 'ingehill@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Caine', 'HILLS', '', '', '', '', '', 'cainehills@msn.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HILLS' AND UPPER(first_name) = 'CAINE') OR LOWER(email_primary) = 'cainehills@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Denise', 'HOLTZ-WILLIAMS', '', '', '', '', '', 'dmwilliams1209@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLTZ-WILLIAMS' AND UPPER(first_name) = 'DENISE') OR LOWER(email_primary) = 'dmwilliams1209@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'HOPPER', '', '', '', '', '', 'david.l.hopper@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOPPER' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'david.l.hopper@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'HUEGEL', '', '', '', '', '', 'tim.huegel@gmail.com', '(303) 883-8910', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUEGEL' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'tim.huegel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'HUNSPERGER', '', '1810 E. STARMIST PLACE', 'Oro Valley', 'AZ', '', 'zonahunz@gmail.com', '(520) 307-0094', 'RV TYPE= AS FLYING CLOUD 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUNSPERGER' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'zonahunz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Norm', 'IHME', '', '', '', '', '', 'normi@baileysallied.com', '(303) 981-3848', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'IHME' AND UPPER(first_name) = 'NORM') OR LOWER(email_primary) = 'normi@baileysallied.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jocelyn', 'JENKS', '', '', '', '', '', 'jenksest@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JENKS' AND UPPER(first_name) = 'JOCELYN') OR LOWER(email_primary) = 'jenksest@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cynthia', 'HAYEK', '', '', '', '', '', 'hampkenny@gmail.com', '(503) 781-5751', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAYEK' AND UPPER(first_name) = 'CYNTHIA') OR LOWER(email_primary) = 'hampkenny@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'GINGERICH', '', '', '', '', '', 'gingerich@msn.com', '(480) 200-4019', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GINGERICH' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'gingerich@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tracy', 'GRAY', '', '', '', '', '', 'tgray@aol.com', '(303) 902-8856', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRAY' AND UPPER(first_name) = 'TRACY') OR LOWER(email_primary) = 'tgray@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joan', 'HAMBLY', '', '', '', '', '', 'imjoani246@gmail.com', '(303) 249-1237', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAMBLY' AND UPPER(first_name) = 'JOAN') OR LOWER(email_primary) = 'imjoani246@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'HAMLIN', '', '', '', '', '', 'dehamlin@yahoo.com', '(303) 421-8555', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAMLIN' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'dehamlin@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'HARPE', '', '', '', '', '', 'steveharpe@me.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARPE' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'steveharpe@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'HARPER', '', '', '', '', '', 'eric.harper@state.co.us', '(303) 204-4583', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARPER' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'eric.harper@state.co.us');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sarah-John', 'HARRIS', '', '', '', '', '', 'jmhharris@gmail.com', '(719) 660-4169', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARRIS' AND UPPER(first_name) = 'SARAH-JOHN') OR LOWER(email_primary) = 'jmhharris@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'HARRIS', '', '', '', '', '', '', '(866) 403-5338', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARRIS' AND UPPER(first_name) = 'MARK'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sandy', 'HASTINGS', '', '', '', '', '', 'sandyhastings8@gmail.com', '(420) 955-3220', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HASTINGS' AND UPPER(first_name) = 'SANDY') OR LOWER(email_primary) = 'sandyhastings8@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patricia', 'HATEM', '', '', '', '', '', 'pahatem@gmail.com', '(262) 488-0220', 'RV TYPE= SPRINTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HATEM' AND UPPER(first_name) = 'PATRICIA') OR LOWER(email_primary) = 'pahatem@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Timothy', 'HAWKS', '', '', '', '', '', 'tina5041@msn.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAWKS' AND UPPER(first_name) = 'TIMOTHY') OR LOWER(email_primary) = 'tina5041@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lance', 'LEWIS', '', '', '', '', '', 'lclewis7@gmail.com', '(563) 970-0813', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEWIS' AND UPPER(first_name) = 'LANCE') OR LOWER(email_primary) = 'lclewis7@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jonathan', 'LINHART', '', '', '', '', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINHART' AND UPPER(first_name) = 'JONATHAN'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joel', 'LIVINGSTON', '', '', '', '', '', 'joelandsabine@gmail.com', '(307) 287-1203', 'RV TYPE= LANCE M2612  2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LIVINGSTON' AND UPPER(first_name) = 'JOEL') OR LOWER(email_primary) = 'joelandsabine@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mhairi', 'LOEB', '', '', '', '', '', 'mhairi.loeb@gmail.com', '(970) 309-5051', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LOEB' AND UPPER(first_name) = 'MHAIRI') OR LOWER(email_primary) = 'mhairi.loeb@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Leslie', 'LORENZ', '', '', '', '', '', 'lesliejlorenz@gmail.com', '(206) 384-0280', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LORENZ' AND UPPER(first_name) = 'LESLIE') OR LOWER(email_primary) = 'lesliejlorenz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'LUCERO', '', '', '', '', '', 'robertdlucero@yahoo.com', '(303) 249-5617', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUCERO' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'robertdlucero@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cody', 'SUTHERLAND', '', '', '', 'CO', '', 'codysuth@gmail.com', '(303) 875-3165', 'RV TYPE= AS FC | Alt email: chris@boulderenvironmental.com | Alt phone: (303) 817-8243', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SUTHERLAND' AND UPPER(first_name) = 'CODY') OR LOWER(email_primary) = 'codysuth@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Colin', 'MATTSON', '', '', '', '', '', 'colinfmattson@gmail.com', '(248) 736-6627', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MATTSON' AND UPPER(first_name) = 'COLIN') OR LOWER(email_primary) = 'colinfmattson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'MAVGLAMER', '', '', '', '', '', 'themavglamers@gmail.com', '(785) 424-5854', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAVGLAMER' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'themavglamers@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alyssa', 'MCDANIEL', '', '', '', '', '', 'alyssa_a_mcdaniel@yahoo.com', '(303) 908-3407', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCDANIEL' AND UPPER(first_name) = 'ALYSSA') OR LOWER(email_primary) = 'alyssa_a_mcdaniel@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dayle', 'MCDANIEL', '', '', '', '', '', 'daylecedars@gmail.com', '(303) 907-3698', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCDANIEL' AND UPPER(first_name) = 'DAYLE') OR LOWER(email_primary) = 'daylecedars@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Casey', 'LANE', '', '', '', '', '', 'cdl2306@live.com', '(814) 506-6917', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LANE' AND UPPER(first_name) = 'CASEY') OR LOWER(email_primary) = 'cdl2306@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'JOHNSON', '', '', '', '', '', 'dan.j.johnson303@gmail.com', '(303) 704-3635', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'dan.j.johnson303@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'JOHNSON', '', '', '', '', '', 'murman1940@yahoo.com', '(303) 570-4942', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'murman1940@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amy', 'KEITH', '', '322 YOUNG CIRCLE', 'Castle Rock', 'CO', '', 'amykeith@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KEITH' AND UPPER(first_name) = 'AMY') OR LOWER(email_primary) = 'amykeith@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jodi', 'KIEFER', '', '', '', '', '', 'jodikiefer@hotmail.com', '(720) 672-2939', 'RV TYPE= 2445 LANCE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KIEFER' AND UPPER(first_name) = 'JODI') OR LOWER(email_primary) = 'jodikiefer@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'KNIPPELBERG', '', '', '', '', '', 'enohclothing@hotmail.com', '(720) 612-2027', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KNIPPELBERG' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'enohclothing@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron-Patti', 'KOMOROWSKI', '', '', '', '', '', 'komtinker@aol.com', '(303) 269-1702', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOMOROWSKI' AND UPPER(first_name) = 'RON-PATTI') OR LOWER(email_primary) = 'komtinker@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carla', 'KONOPKA', '', '', '', '', '', 'mckonopka@msn.com', '(303) 918-9271', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KONOPKA' AND UPPER(first_name) = 'CARLA') OR LOWER(email_primary) = 'mckonopka@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'KROUT', '', '', '', '', '', 'lisa.krout@hotmail.com', '(303) 249-5617', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KROUT' AND UPPER(first_name) = 'LISA') OR LOWER(email_primary) = 'lisa.krout@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mimi', 'KUCHMAN', '', '', '', '', '', 'mimidenver@comcast.net', '(303) 522-8810', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUCHMAN' AND UPPER(first_name) = 'MIMI') OR LOWER(email_primary) = 'mimidenver@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nancy', 'KURTZ', '', '', '', '', '', 'nancyleekurtz@comcast.net', '(720) 290-8659', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KURTZ' AND UPPER(first_name) = 'NANCY') OR LOWER(email_primary) = 'nancyleekurtz@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'LANDIS', '', '', '', '', '', 'matthewlandis@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LANDIS' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'matthewlandis@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mitch', 'EMORY', '', '1067 E HWY 24 UNIT 81', 'Woodland Park', 'CO', '', 'emormit1997@gmail.com', '(262) 212-4677', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EMORY' AND UPPER(first_name) = 'MITCH') OR LOWER(email_primary) = 'emormit1997@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'DONNELLY', '', '', 'Wheatridge', 'CO', '', 'jimdonnelly24@gmail.com', '(303) 709-5575', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DONNELLY' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jimdonnelly24@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '', 'JON', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JON' AND UPPER(first_name) = ''));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg/Kathrin', 'MCGRATH/TROXLER', '', '', 'Houston', 'TX', '', 'silkbay90@gmail.com', '(346) 334-0796', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCGRATH/TROXLER' AND UPPER(first_name) = 'GREG/KATHRIN') OR LOWER(email_primary) = 'silkbay90@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jane', 'LAMBERT', '', '', '', 'CO', '', 'jlambert98765@gmail.com', '(813) 784-0015', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LAMBERT' AND UPPER(first_name) = 'JANE') OR LOWER(email_primary) = 'jlambert98765@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'BRADLEY', '', 'EVENT  MARKETING DRIVERS', '', 'CO', '', 'matthewb85@live.com', '(636) 288-1281', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRADLEY' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'matthewb85@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'BUE', '', '3545 AKRON ST', 'Denver', 'CO', '', 'christopherbue@gmail.com', '(303) 506-7324', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUE' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'christopherbue@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Linda', 'SCHOFIELD', '', '', '', 'CO', '', 'lindaschofieldmph@gmail.com', '(860) 604-6578', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHOFIELD' AND UPPER(first_name) = 'LINDA') OR LOWER(email_primary) = 'lindaschofieldmph@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dave', 'KEYFAUVER', '', '', '', 'CO', '', 'cokeywe@msn.com', '(720) 315-5667', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KEYFAUVER' AND UPPER(first_name) = 'DAVE') OR LOWER(email_primary) = 'cokeywe@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'WOLDRUFF', '', '', '', 'CO', '', 'jtwoldruff7@yahoo.com', '(970) 462-1535', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOLDRUFF' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jtwoldruff7@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeremy', 'VIGIL', '', 'WALK IN CUSTOMER', '', 'CO', '', '', '(720) 998-4700', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VIGIL' AND UPPER(first_name) = 'JEREMY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard & Linda', 'KOENIG', '', '', '', 'CO', '', 'kingwoodkoenigs@aol.com', '(303) 522-1103', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOENIG' AND UPPER(first_name) = 'RICHARD & LINDA') OR LOWER(email_primary) = 'kingwoodkoenigs@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Laura', 'HARVEY', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARVEY' AND UPPER(first_name) = 'LAURA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Laura', 'HARVEY', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARVEY' AND UPPER(first_name) = 'LAURA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Laura', 'HARVEY', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARVEY' AND UPPER(first_name) = 'LAURA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scarlett', 'FOSS', '', '3048 REDWOOD ST.', 'Anchorage', 'AK', '', 'rae.foss@yahoo.com', '(907) 748-1855', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOSS' AND UPPER(first_name) = 'SCARLETT') OR LOWER(email_primary) = 'rae.foss@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'PERRIN', '', '909 BANNOCK ST #1631', 'Denver', 'CO', '', 'scott@scottperrin.com', '(720) 232-5569', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PERRIN' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'scott@scottperrin.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kirsty - Chris', 'LOCKHART - WITTE', '', '', '', 'CO', '', 'klock222@hotmail.com', '(720) 595-5674', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LOCKHART - WITTE' AND UPPER(first_name) = 'KIRSTY - CHRIS') OR LOWER(email_primary) = 'klock222@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James & Nanette', 'TAYLOR', '', '', '', 'CO', '', 'nanette1126@live.com', '(205) 901-8008', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAYLOR' AND UPPER(first_name) = 'JAMES & NANETTE') OR LOWER(email_primary) = 'nanette1126@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'REINHOLT', '', '', '', 'CO', '', 'kyle.reinholt@gmail.com', '(303) 503-3590', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REINHOLT' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'kyle.reinholt@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tristan P', 'WEBB', '', '', '', 'CO', '', 'tpdubbs@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEBB' AND UPPER(first_name) = 'TRISTAN P') OR LOWER(email_primary) = 'tpdubbs@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bryon', 'ASHLEY', '', '', '', 'CO', '', 'zoril123@hotmail.com', '(206) 227-4527', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ASHLEY' AND UPPER(first_name) = 'BRYON') OR LOWER(email_primary) = 'zoril123@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kc', 'FLYNN', '', '', '', 'CO', '', 'kcf1226@gmail.com', '(319) 533-7778', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FLYNN' AND UPPER(first_name) = 'KC') OR LOWER(email_primary) = 'kcf1226@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'LABATE', '', '', '', 'CO', '', 'johnlb8@gmail.com', '(303) 249-4045', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LABATE' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'johnlb8@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alex', 'SCHAMONIN', '', '', '', 'CO', '', '', '(619) 222-6278', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHAMONIN' AND UPPER(first_name) = 'ALEX'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Payton Nelson', 'RICHARD STEBBINS JR.', '', '', '', 'CO', '', 'richard.stebbins@colorado.edu', '(303) 710-3560', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICHARD STEBBINS JR.' AND UPPER(first_name) = 'PAYTON NELSON') OR LOWER(email_primary) = 'richard.stebbins@colorado.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brandon', 'SMITH', '', '', '', 'CO', '', 'brandonsmithcu@gmail.com', '(970) 708-4734', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'BRANDON') OR LOWER(email_primary) = 'brandonsmithcu@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '', 'INVENTORY PRICING', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'INVENTORY PRICING' AND UPPER(first_name) = ''));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'RUSCETTA', '', '5840 E. 118TH PL', 'Thornton', 'CO', '', 'miketct@msn.com', '(303) 356-9206', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUSCETTA' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'miketct@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Junior', 'REYES', '', '', '', 'CO', '', 'junior.reyes@dpfalternztives.com', '(720) 697-3810', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REYES' AND UPPER(first_name) = 'JUNIOR') OR LOWER(email_primary) = 'junior.reyes@dpfalternztives.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeffrey', 'BINNEY', '', '', '', 'CO', '', 'jjb@jjb.life', '(917) 628-3931', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BINNEY' AND UPPER(first_name) = 'JEFFREY') OR LOWER(email_primary) = 'jjb@jjb.life');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Luis', 'ACOSTA', '', '', '', 'CO', '', 'luigimario06@yahoo.com', '(720) 333-7654', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ACOSTA' AND UPPER(first_name) = 'LUIS') OR LOWER(email_primary) = 'luigimario06@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicole', 'NICOLE', '', '', '', 'CO', '', 'coley1836@gmail.com', '(720) 218-1760', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NICOLE' AND UPPER(first_name) = 'NICOLE') OR LOWER(email_primary) = 'coley1836@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '', 'RIGGINS', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIGGINS' AND UPPER(first_name) = ''));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Arthur', 'BROWN', '', '', '', 'CO', '', 'instaltmed@gmail.com', '(303) 639-9448', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BROWN' AND UPPER(first_name) = 'ARTHUR') OR LOWER(email_primary) = 'instaltmed@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Karen', 'MUSSER', '', '', 'Evergreen', 'CO', '', 'kmusser@aol.com', '(407) 421-2640', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MUSSER' AND UPPER(first_name) = 'KAREN') OR LOWER(email_primary) = 'kmusser@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Randy', 'RAUEN', '', '150 KING ST', 'Denver', 'CO', '', 'randyrrauen@gmail.com', '(720) 839-0858', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAUEN' AND UPPER(first_name) = 'RANDY') OR LOWER(email_primary) = 'randyrrauen@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'SPILBORGHS', '', '', '', 'CO', '', 'rspilborghs19@gmail.com', '(805) 698-2294', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SPILBORGHS' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'rspilborghs19@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Al', 'PRUIT', '', '', '', 'CO', '', '', '(303) 885-3797', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRUIT' AND UPPER(first_name) = 'AL'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'OLGUIN', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OLGUIN' AND UPPER(first_name) = 'CHRISTOPHER'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Olivia', 'FISCHER', '', '', '', 'CO', '', 'olivia.pinon@gmail.com', '(541) 740-2513', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FISCHER' AND UPPER(first_name) = 'OLIVIA') OR LOWER(email_primary) = 'olivia.pinon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'MARTIN', '', '', '', 'CO', '', 'ronmar71@hotmail.com', '(260) 687-1437', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTIN' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'ronmar71@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joshua', 'FRIEDMAN', '', '', 'Denver', 'CO', '', 'friedman@elanartists.com', '(646) 753-2616', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRIEDMAN' AND UPPER(first_name) = 'JOSHUA') OR LOWER(email_primary) = 'friedman@elanartists.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ralph', 'ESPINOSA', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPINOSA' AND UPPER(first_name) = 'RALPH'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'BELL', '', '', '', 'CO', '', 'paddenbell@gmail.com', '(303) 916-0297', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BELL' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'paddenbell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'GABORY', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GABORY' AND UPPER(first_name) = 'LISA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stevie', 'COLLINS', '', '', '', 'CO', '', 'sray73@gmail.com', '(832) 405-4722', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLLINS' AND UPPER(first_name) = 'STEVIE') OR LOWER(email_primary) = 'sray73@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christine', 'HOLLANDER', '', '', '', 'CO', '', 'cthollander46@gmail.com', '(310) 850-5303', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLLANDER' AND UPPER(first_name) = 'CHRISTINE') OR LOWER(email_primary) = 'cthollander46@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cindy And David', 'VENEY', '', '', '', 'CO', '', 'cindyveney@gmail.com', '(303) 905-2417', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VENEY' AND UPPER(first_name) = 'CINDY AND DAVID') OR LOWER(email_primary) = 'cindyveney@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mayra', 'TOVAR', '', '', '', 'CO', '', 'mayraatovar@aol.com', '(909) 904-5665', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TOVAR' AND UPPER(first_name) = 'MAYRA') OR LOWER(email_primary) = 'mayraatovar@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ralph', 'ESPINOZA', '', '', '', 'CO', '', 'espinozaden@comcast.net', '(303) 868-0194', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPINOZA' AND UPPER(first_name) = 'RALPH') OR LOWER(email_primary) = 'espinozaden@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brandon', 'TOLANY', '', '910 GAYLORD', 'Denver', 'CO', '', 'bdtolany@gmail.com', '(512) 994-5744', 'Alt email: claimspayables@revolos.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TOLANY' AND UPPER(first_name) = 'BRANDON') OR LOWER(email_primary) = 'bdtolany@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Enrico', 'FORMAINI', '', '', '', 'CO', '', 'eforma130@gmail.com', '(661) 755-7794', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FORMAINI' AND UPPER(first_name) = 'ENRICO') OR LOWER(email_primary) = 'eforma130@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Beth', 'VANLANDINGHAM', '', '1781 OSWEGO ST', 'Aurora', 'CO', '', 'bvanlandingham@cn.edu', '(423) 930-6126', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VANLANDINGHAM' AND UPPER(first_name) = 'BETH') OR LOWER(email_primary) = 'bvanlandingham@cn.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dean', 'MCKENZIE', '', '', '', 'CO', '', 'edeanmckenzie@gmail.com', '(713) 703-4154', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCKENZIE' AND UPPER(first_name) = 'DEAN') OR LOWER(email_primary) = 'edeanmckenzie@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zack', 'SMITH', '', '', '', 'CO', '', 'zacklynnsmith@gmail.com', '(310) 612-3507', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'ZACK') OR LOWER(email_primary) = 'zacklynnsmith@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'FOGG', '', '', '', 'CO', '', 'michaelfogg99@gmail.com', '(856) 776-6211', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOGG' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'michaelfogg99@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jackson', 'RUDD', '', '', '', 'CO', '', 'jacksonpr95@gmail.com', '(801) 455-2501', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUDD' AND UPPER(first_name) = 'JACKSON') OR LOWER(email_primary) = 'jacksonpr95@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'WILT', '', '', '', '', '', 'dubbles@gmail.com', '(558) 538-3783', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILT' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'dubbles@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Todd', 'WISEMAN', '', '', '', '', '', 'toddwise@gmail.com', '(303) 725-5166', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WISEMAN' AND UPPER(first_name) = 'TODD') OR LOWER(email_primary) = 'toddwise@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cameron', 'WYLDE', '', '', '', '', '', 'cameronwylde1@gmail.com', '(720) 717-0082', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WYLDE' AND UPPER(first_name) = 'CAMERON') OR LOWER(email_primary) = 'cameronwylde1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pat', 'ZELLA', '', '', '', '', '', 'patzella@outlook.com', '(720) 530-0177', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZELLA' AND UPPER(first_name) = 'PAT') OR LOWER(email_primary) = 'patzella@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kent', 'SHERER', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHERER' AND UPPER(first_name) = 'KENT'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cody', 'MALLETTE', '', '', '', 'CO', '', 'co.mallette@gmail.com', '(832) 541-1022', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MALLETTE' AND UPPER(first_name) = 'CODY') OR LOWER(email_primary) = 'co.mallette@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Martin', 'NEWTON', '', '', '', 'CO', '', 'the.martin.newton@gmail.com', '(780) 893-0822', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NEWTON' AND UPPER(first_name) = 'MARTIN') OR LOWER(email_primary) = 'the.martin.newton@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '', 'TEST', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TEST' AND UPPER(first_name) = ''));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicole', 'MONTOYA', '', '', '', 'CO', '', 'nicole4955@yahoo.com', '(720) 589-8227', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTOYA' AND UPPER(first_name) = 'NICOLE') OR LOWER(email_primary) = 'nicole4955@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chuck', 'PADILLA', '', '2820 N. MARION', 'Denver', 'CO', '', 'rcpadilla1855@gmail.com', '(720) 327-3840', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PADILLA' AND UPPER(first_name) = 'CHUCK') OR LOWER(email_primary) = 'rcpadilla1855@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'SITZLER', '', '', '', 'CO', '', 'ryansitzler@gmail.com', '(205) 999-7389', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SITZLER' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'ryansitzler@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lew', 'KINGDOM', '', '', '', 'CO', '', 'lkingdom@comcast.net', '(303) 898-2575', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KINGDOM' AND UPPER(first_name) = 'LEW') OR LOWER(email_primary) = 'lkingdom@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'SOBCZAK', '', '', '', 'CO', '', 'socialbobcat@gmail.com', '(813) 240-6932', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SOBCZAK' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'socialbobcat@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ralph', 'ESPINOZA', '', '1721 W. CHAFFEE PLACE', 'Denver', 'CO', '', 'espinozaden@comcast.net', '(303) 868-0194', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPINOZA' AND UPPER(first_name) = 'RALPH') OR LOWER(email_primary) = 'espinozaden@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'MCCANDLESS', '', '', '', 'CO', '', 'tpmccandless@yahoo.com', '(303) 818-7313', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCANDLESS' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'tpmccandless@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'OLSHANSKY', '', '', '', '', '', 'mark_olshansky@hotmail.com', '(612) 978-4000', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OLSHANSKY' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'mark_olshansky@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shannon', 'GROSS', '', '', '', 'CO', '', 'shannon.gross@outlook.com', '(814) 397-8683', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GROSS' AND UPPER(first_name) = 'SHANNON') OR LOWER(email_primary) = 'shannon.gross@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'ALEXANDER', '', '', '', 'CO', '', 'jreedalex@gmail.com', '(303) 619-8555', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ALEXANDER' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jreedalex@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Caden', 'RUPNOW', '', '246 DRY HOLLOW', 'Spring Branch', 'TX', '', 'cadenrupnow@gmail.com', '(469) 503-9309', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUPNOW' AND UPPER(first_name) = 'CADEN') OR LOWER(email_primary) = 'cadenrupnow@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'CARRIER', '', '', '', '', '', 'mcarrier3500@yahoo.com', '(303) 880-5499', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARRIER' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mcarrier3500@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'GAYNOR', '', '', '', 'CO', '', 'daniel@ptcbd.net', '(970) 368-0865', 'NO: 70012 R/O: Oct 25 2023 - 16:01 ID: 3 ********************', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GAYNOR' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'daniel@ptcbd.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'HADANK', '', '', '', 'CO', '', 'hadank@gmail.com', '(773) 459-9556', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HADANK' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'hadank@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'CRANSTON', '', '', '', 'CO', '', 'rc12215@gmail.com', '(303) 408-5108', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CRANSTON' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'rc12215@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '', 'YOGURST', '', '', '', 'CO', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YOGURST' AND UPPER(first_name) = ''));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Karen & Jeff', 'CROSS', '', '', '', 'CO', '', 'kmcross12@gmail.com', '(314) 495-4368', 'Alt email: jeffcross1@mac.com | Alt phone: (314) 479-8386', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CROSS' AND UPPER(first_name) = 'KAREN & JEFF') OR LOWER(email_primary) = 'kmcross12@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'COXON', '', '', '', 'CO', '', 'dcoxon02@gmail.com', '(303) 775-7185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COXON' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'dcoxon02@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bailey', 'ROGERS', '', '', '', 'CO', '', 'bailey_rogers13@yahoo.com', '(706) 982-0753', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROGERS' AND UPPER(first_name) = 'BAILEY') OR LOWER(email_primary) = 'bailey_rogers13@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'KROUSE', '', '', 'Denver', 'CO', '', 'jkrouse@dpsk12.net', '(720) 879-2043', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KROUSE' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jkrouse@dpsk12.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Barbara', 'BROWN', '', '411 WALNUT ST. #11916', 'Green Cove Springs', 'FL', '', 'barbara@1220enterprises.com', '(954) 707-9910', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BROWN' AND UPPER(first_name) = 'BARBARA') OR LOWER(email_primary) = 'barbara@1220enterprises.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Adriano', 'CALOIARO', '', '5536 SIMONTON ST', 'Bradenton', 'FL', '', 'adriano@adriano.fyi', '(407) 749-2213', 'Alt email: me@adriano.fyi | Alt phone: (718) 407-9855', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CALOIARO' AND UPPER(first_name) = 'ADRIANO') OR LOWER(email_primary) = 'adriano@adriano.fyi');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Liston', 'OGANA', '', '', '', 'CO', '', 'liston.ogana@gmail.com', '(720) 308-3588', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OGANA' AND UPPER(first_name) = 'LISTON') OR LOWER(email_primary) = 'liston.ogana@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'CYMERMAN', '', '', '', '', '', 'mikecymerman@gmail.com', '(303) 250-2500', 'RV TYPE= JAYCO OCTANE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CYMERMAN' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mikecymerman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim & Anne', 'COLE', '', 'UNSUBSCRIBED', '', '', '', 'coles4519@comcast.net', '(303) 601-7678', 'RV TYPE= ESTEEM CLASS C', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLE' AND UPPER(first_name) = 'TIM & ANNE') OR LOWER(email_primary) = 'coles4519@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dennis', 'CAPPS', '', '', '', '', '', 'denniscapps23@gmail.com', '(303) 919-1700', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAPPS' AND UPPER(first_name) = 'DENNIS') OR LOWER(email_primary) = 'denniscapps23@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'AGEMA', '', '', '', '', '', 'rick.agema@mewhinney.com', '(303) 815-0644', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AGEMA' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'rick.agema@mewhinney.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'DASPIT', '', '', '', '', '', 'cleanbiker1@msn.com', '(303) 402-1478', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DASPIT' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'cleanbiker1@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'BURKHART', '', '', '', '', '', 'mister2t@aol.com', '(719) 481-4821', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURKHART' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'mister2t@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'BARKER', '', '', '', '', '', 'gbarker21@mac.com', '(303) 956-1199', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARKER' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'gbarker21@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ian', 'CAREY', '', '', '', '', '', 'careyi@rocketmail.com', '(818) 661-0394', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAREY' AND UPPER(first_name) = 'IAN') OR LOWER(email_primary) = 'careyi@rocketmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jena', 'CLINE', '', '', '', '', '', 'jenacline@yahoo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLINE' AND UPPER(first_name) = 'JENA') OR LOWER(email_primary) = 'jenacline@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bobby', 'GIANG', '', '', '', '', '', 'bobbygiang123@aol.com', '(720) 886-0772', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GIANG' AND UPPER(first_name) = 'BOBBY') OR LOWER(email_primary) = 'bobbygiang123@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'CAREY', '', '', '', '', '', 'wmscarey@comcast.net', '(303) 518-3706', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAREY' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'wmscarey@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'BRITT', '', '', '', '', '', 'taosmike@hotmail.com', '(432) 416-0035', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRITT' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'taosmike@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'AMOROSO', '', '', '', '', '', 'joeamoroso@me.com', '(303) 524-2536', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AMOROSO' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'joeamoroso@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marguerite', 'BELLAVANCE', '', '', '', '', '', 'aungstda@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BELLAVANCE' AND UPPER(first_name) = 'MARGUERITE') OR LOWER(email_primary) = 'aungstda@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joni', 'BRETZ', '', '', '', '', '', 'bretz.joni@yahoo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRETZ' AND UPPER(first_name) = 'JONI') OR LOWER(email_primary) = 'bretz.joni@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kristine', 'BEARD', '', '', '', '', '', 'kristieleighslp@gmail.com', '(501) 208-4873', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BEARD' AND UPPER(first_name) = 'KRISTINE') OR LOWER(email_primary) = 'kristieleighslp@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'FITZPATRICK', '', '', '', '', '', 'bobfitzjr@yahoo.com', '(720) 384-3141', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FITZPATRICK' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'bobfitzjr@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Wilford', 'BURT', '', '', '', '', '', 'willburt43@gmail.com', '(303) 229-7365', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURT' AND UPPER(first_name) = 'WILFORD') OR LOWER(email_primary) = 'willburt43@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'BESERRA', '', '', '', '', '', 'gbeserra@me.com', '(303) 589-0221', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BESERRA' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gbeserra@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'BUTTS', '', '', '', '', '', 'georgebutts8@gmail.com', '(206) 489-8957', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUTTS' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'georgebutts8@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Phillip', 'BATCHELOR', '', '', '', '', '', 'philbdenver@aol.com', '(303) 906-8489', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BATCHELOR' AND UPPER(first_name) = 'PHILLIP') OR LOWER(email_primary) = 'philbdenver@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'COSBY', '', '', '', '', '', 'fafano1@msn.com', '(720) 636-4066', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COSBY' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'fafano1@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Erika', 'CUNHA', '', '', '', '', '', 'spearheadmarketing@gmail.com', '(850) 252-5679', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CUNHA' AND UPPER(first_name) = 'ERIKA') OR LOWER(email_primary) = 'spearheadmarketing@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'CAMPBELL', '', '', '', '', '', 'chrishc2011@gmail.com', '(303) 887-3316', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAMPBELL' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'chrishc2011@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jon', 'DOUDUA', '', '', '', '', '', 'doudua@hotmail.com', '(303) 994-5151', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOUDUA' AND UPPER(first_name) = 'JON') OR LOWER(email_primary) = 'doudua@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allyson', 'EVANS', '', '', '', '', '', 'allysonevans@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EVANS' AND UPPER(first_name) = 'ALLYSON') OR LOWER(email_primary) = 'allysonevans@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'FERNSTRUM', '', '', '', '', '', 'fernstrum@gmail.com', '(303) 994-0119', 'RV TYPE= LANCE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FERNSTRUM' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'fernstrum@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Reed', 'CLANAHAN', '', '', '', '', '', 'reedmclanahan@gmail.com', '(720) 608-6335', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLANAHAN' AND UPPER(first_name) = 'REED') OR LOWER(email_primary) = 'reedmclanahan@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jennifer', 'BAIRD', '', '', '', '', '', 'jkbaird@comcast.net', '(303) 941-7818', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAIRD' AND UPPER(first_name) = 'JENNIFER') OR LOWER(email_primary) = 'jkbaird@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ed', 'DECECCO', '', '', '', '', '', 'ed.dececco@gmail.com', '(303) 819-8865', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DECECCO' AND UPPER(first_name) = 'ED') OR LOWER(email_primary) = 'ed.dececco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chis', 'BRYANT', '', '', '', '', '', 'cmb360@gmail.com', '(720) 445-6766', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRYANT' AND UPPER(first_name) = 'CHIS') OR LOWER(email_primary) = 'cmb360@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Hal', 'DEMOTH', '', '', '', '', '', 'hdemothll@gmail.com', '(303) 279-2568', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEMOTH' AND UPPER(first_name) = 'HAL') OR LOWER(email_primary) = 'hdemothll@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cj', 'DEKIN', '', '', '', '', '', 'cjdekin@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEKIN' AND UPPER(first_name) = 'CJ') OR LOWER(email_primary) = 'cjdekin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'FARIES', '', '', '', '', '', 'fariesjohn@gmail.com', '(720) 440-1322', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FARIES' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'fariesjohn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Julian', 'BRADLEY', '', '', '', '', '', 'creativevisuals@hotmail.com', '(303) 870-3641', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRADLEY' AND UPPER(first_name) = 'JULIAN') OR LOWER(email_primary) = 'creativevisuals@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'ASHLEY', '', '', '', '', '', 'blake.ashley7@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ASHLEY' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'blake.ashley7@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Curtis', 'GILMORE', '', '', '', '', '', 'michicolo3@gmail.com', '(303) 229-0231', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GILMORE' AND UPPER(first_name) = 'CURTIS') OR LOWER(email_primary) = 'michicolo3@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'ANDERSON', '', '', '', '', '', 'andrew1080@gmail.com', '(303) 329-7644', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ANDERSON' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'andrew1080@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason-Sarah', 'FINCHAM', '', '', '', '', '', 'sjfincham5@me.com', '(720) 273-8896', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FINCHAM' AND UPPER(first_name) = 'JASON-SARAH') OR LOWER(email_primary) = 'sjfincham5@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'CLENNEY', '', '', '', '', '', 'clenney4@msn.com', '(720) 456-0484', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLENNEY' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'clenney4@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tamra', 'CARLSON', '', '', '', '', '', 'tamra.padge#@gmail.com', '(303) 960-4292', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARLSON' AND UPPER(first_name) = 'TAMRA') OR LOWER(email_primary) = 'tamra.padge#@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'GIBSON', '', '', '', '', '', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GIBSON' AND UPPER(first_name) = 'JOHN'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bronwyn', 'BAMBER', '', '', '', '', '', 'wynwynb@gmail.com', '(239) 216-2359', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAMBER' AND UPPER(first_name) = 'BRONWYN') OR LOWER(email_primary) = 'wynwynb@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'CLARK', '', '', '', '', '', 'danielazboy@icloud.com', '(520) 839-1195', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLARK' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'danielazboy@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'BAKER', '', '', '', '', '', 'bobchazbaker@gmail.com', '(303) 947-3956', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAKER' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'bobchazbaker@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pauline', 'BALES', '', '', '', '', '', 'pamaritba7@gmail.com', '(828) 280-7991', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BALES' AND UPPER(first_name) = 'PAULINE') OR LOWER(email_primary) = 'pamaritba7@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anne', 'SCHMUCK', '', 'TEICHSTRASSE 4', 'Goseck', 'CO', '6667', 'anne.schmuck@web.de', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHMUCK' AND UPPER(first_name) = 'ANNE') OR LOWER(email_primary) = 'anne.schmuck@web.de');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shannon', 'HOLLOWAY', '', '26 INDIAN MILL ROAD', 'Cos Cob', 'CT', '6807', 'shannon@hollowayone.com', '(203) 273-1933', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLLOWAY' AND UPPER(first_name) = 'SHANNON') OR LOWER(email_primary) = 'shannon@hollowayone.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'DIFILIPPO', '', '340 KINGSTON AVE.', 'Barrington', 'NJ', '8007', 'markdflip@yahoo.com', '(609) 970-4943', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DIFILIPPO' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'markdflip@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amanda', 'SEALE', '', '57 KIM LANE', 'Stormville', 'NY', '12582', 'aseale90z@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SEALE' AND UPPER(first_name) = 'AMANDA') OR LOWER(email_primary) = 'aseale90z@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeremy', 'KOVALESKI', '', '190 MORGANTOWN ROAD', 'Honey Brook', 'PA', '19344', 'jkovaleskiofficial@gmail.com', '(610) 412-7015', 'Alt phone: (610) 406-3113', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOVALESKI' AND UPPER(first_name) = 'JEREMY') OR LOWER(email_primary) = 'jkovaleskiofficial@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'SMITH', '', '2608 NAAMANS ROAD', 'Wilmington', 'DE', '19810', 'bob.smith908@aol.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'bob.smith908@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cabel', 'RICH', '', '13205 THORNTON DR.', 'Gainesville', 'VA', '20155', '', '(720) 456-5718', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICH' AND UPPER(first_name) = 'CABEL'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'SPASARO', '', '8603 DELLWAY LANE', 'Vienna', 'VA', '22180', 'p2xheli@yahoo.com', '(540) 325-2994', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SPASARO' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'p2xheli@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jt', 'MAXWELL', '', '432 WOODLANDS ROAD', 'Charlottesville', 'VA', '22901', 'jt@grandclassroom.com', '(434) 962-5206', 'RV TYPE= LUXE ELITE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAXWELL' AND UPPER(first_name) = 'JT') OR LOWER(email_primary) = 'jt@grandclassroom.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Donnie', 'PURYEAR', '', '123 SAILFISH DR.', 'Manteo', 'NC', '27954', 'dapuryear23@gmail.com', '(919) 607-3219', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PURYEAR' AND UPPER(first_name) = 'DONNIE') OR LOWER(email_primary) = 'dapuryear23@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Becky', 'SHAW', '', '445 MIMOSA DR.', 'Decatur', 'GA', '30030', 'sheckybaw@gmail.com', '(678) 595-0036', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHAW' AND UPPER(first_name) = 'BECKY') OR LOWER(email_primary) = 'sheckybaw@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dj', 'BARAJAS', 'SOUTHWIRE COMPANY', 'ONE SOUTHWIRE DRIVE', 'Carrollton', 'GA', '30119', 'dj.barajas@southwire.com', '(303) 827-4372', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARAJAS' AND UPPER(first_name) = 'DJ') OR LOWER(email_primary) = 'dj.barajas@southwire.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'RAYBORN', '', '1009 WOODLAND AVE. SE', 'Atlanta', 'GA', '30316', 'tonsafreestuff@gmail.com', '(615) 480-2454', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAYBORN' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'tonsafreestuff@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'HOLTZCLAW', '', '170 BELMONT OAKS DRIVE', 'Talmo', 'GA', '30575', 'jhol4679@gmail.com', '(678) 316-4617', 'Alt phone: (770) 540-7203', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLTZCLAW' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'jhol4679@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'JOHNSONLEE', '', '313 UNION HILL DR.', 'Ponte Vedra', 'FL', '32081', 'johnsonlee.richard7@gmail.com', '(903) 749-2211', 'RV TYPE= GD TRANSCEND 2023', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSONLEE' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'johnsonlee.richard7@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'DAM', '', '526 S PENISNULA', 'New Smyrna Beach', 'FL', '32169', 'markddam@gmail.com', '(386) 689-7923', 'Alt phone: (386) 690-7761', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAM' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'markddam@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Austin', 'ROMAINE', '', '13901 SUTTON PARK DR. S', 'Jacksonville', 'FL', '32224', 'acromaine@gmail.com', '(904) 327-5656', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROMAINE' AND UPPER(first_name) = 'AUSTIN') OR LOWER(email_primary) = 'acromaine@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Melissa', 'FILANOWSKI', '', '5753 HWY 85 N #4017', 'Crestview', 'FL', '32536', 'melfil5@aol.com', '(203) 650-4704', 'RV TYPE= AS EXCELLA 2000', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FILANOWSKI' AND UPPER(first_name) = 'MELISSA') OR LOWER(email_primary) = 'melfil5@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christine', 'HOLLANDER', '', '5753 HWY 85N.', 'Crestview', 'FL', '32536', 'cthollander46@gmail.com', '(310) 850-5303', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLLANDER' AND UPPER(first_name) = 'CHRISTINE') OR LOWER(email_primary) = 'cthollander46@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patty And Pat', 'REED-REIMER', '', '7901 LAKE ROSS LANE', 'Sanford', 'FL', '32771', 'patrr@bellsouth.net', '(407) 718-2708', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REED-REIMER' AND UPPER(first_name) = 'PATTY AND PAT') OR LOWER(email_primary) = 'patrr@bellsouth.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'GENOVESE', '', '5005 GREEN ISLAND PLACE', 'Vero Beach', 'FL', '32967', 'uschi293@aol.com', '(772) 538-5908', 'RV TYPE= THOR QUANTUM', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GENOVESE' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'uschi293@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Susan', 'GAYNOR', '', '1100 SOUTH FLAGLER DR.', 'West Palm Beach', 'FL', '33401', '', '(513) 703-7673', 'RV TYPE= AS ATLAS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GAYNOR' AND UPPER(first_name) = 'SUSAN'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joshua', 'HENDERSON', '', '616 YELVINGTON AVE.', 'Clearwater', 'FL', '33756', 'j.henderson8957@yahoo.com', '(910) 478-5743', 'RV TYPE= PALOMINO TRUCK CAMPER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HENDERSON' AND UPPER(first_name) = 'JOSHUA') OR LOWER(email_primary) = 'j.henderson8957@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'MCCONNELL', '', '420 JAY CT.', 'North Fort Myers', 'FL', '33903', 'brewfin2na@yahoo.com', '(310) 503-5049', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCONNELL' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'brewfin2na@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'ALDERMAN', '', '702 32ND AVE WEST', 'Palmetto', 'FL', '34221', 'gald4@aol.com', '(941) 713-1674', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ALDERMAN' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'gald4@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anna', 'RUSSO', '', '2907 BAY CITY TERRACE', 'North Port', 'FL', '34286', 'jessiahmurray2907@gmail.com', '(941) 400-0488', 'RV TYPE= CUSTOM TT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUSSO' AND UPPER(first_name) = 'ANNA') OR LOWER(email_primary) = 'jessiahmurray2907@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Julie', 'BAILEY', '', '11582 W KINGFISHER CT', 'Crystal River', 'FL', '34429', 'juliebaileyhome@gmail.com', '(303) 489-7502', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAILEY' AND UPPER(first_name) = 'JULIE') OR LOWER(email_primary) = 'juliebaileyhome@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stanley', 'DECKERT', '', '8335 JAYSON DR', 'Brooksville', 'FL', '34613', 'stanleydeckert@yahoo.com', '(727) 647-0853', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DECKERT' AND UPPER(first_name) = 'STANLEY') OR LOWER(email_primary) = 'stanleydeckert@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'STALLINGS', '', '106 CARLYLE DR.', 'Palm Harbor', 'FL', '34683', 'vdkg123@gmail.com', '(516) 451-7979', 'Alt phone: (727) 858-7070', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STALLINGS' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'vdkg123@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'POWERS', '', 'po box 9', 'Indiantown', 'FL', '34956', 'brian@equestevent.com', '(772) 260-1543', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'POWERS' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brian@equestevent.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Caroline', 'FUNCHESS', '', '3037 ADLEY CR.', 'Birmingham', 'AL', '35244', 'cfayelee2016@gmail.com', '(707) 720-7794', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FUNCHESS' AND UPPER(first_name) = 'CAROLINE') OR LOWER(email_primary) = 'cfayelee2016@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeffrey', 'GOWER', '', '924 PLANTATION WAY', 'Gallatin', 'TN', '37066', 'gower4087@gmail.com', '(303) 522-2350', 'RV TYPE= AS ATLAS 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOWER' AND UPPER(first_name) = 'JEFFREY') OR LOWER(email_primary) = 'gower4087@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'TERRY', '', '4718 GRANNY WHITE PIKE', 'Nashville', 'TN', '37220', 'jterry73@gmail.com', '(646) 409-1425', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TERRY' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'jterry73@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Suzi', 'ZIELINSKI', '', '390 OLD WOODBURY HWY', 'Manchester', 'TN', '37355', 'arelh66327@gmail.com', '(443) 553-2786', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIELINSKI' AND UPPER(first_name) = 'SUZI') OR LOWER(email_primary) = 'arelh66327@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alex', 'HARRY', '', '1420 ADAMS ST.', 'Chattanooga', 'TN', '37408', 'alexharry6464@gmail.com', '(386) 846-9215', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARRY' AND UPPER(first_name) = 'ALEX') OR LOWER(email_primary) = 'alexharry6464@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicole', 'RALSTON', '', '5211 MRN. MT. GILEAD', 'Caledonia', 'OH', '43314', 'nicole3627@yahoo.com', '(614) 641-6354', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RALSTON' AND UPPER(first_name) = 'NICOLE') OR LOWER(email_primary) = 'nicole3627@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Melvin', 'ORTIZ', '', '2315 FORESDALE AVE. #104', 'Cleveland', 'OH', '44109', 'melvin.ortiz14@yahoo.com', '(787) 669-1659', 'RV TYPE= TERRY TT 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ORTIZ' AND UPPER(first_name) = 'MELVIN') OR LOWER(email_primary) = 'melvin.ortiz14@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicholas', 'JAGER', '', '6139 E. JENSEN ROAD', 'Martinsville', 'IN', '46151', 'nicholasejager@gmail.com', '(317) 473-0969', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JAGER' AND UPPER(first_name) = 'NICHOLAS') OR LOWER(email_primary) = 'nicholasejager@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Molly/Chuck', 'GUNNING', '', '514 AMERICAS WAY #8305', 'Box Elder', 'SD', '57719', 'chuck.gunning@gmail.com', '(303) 667-7748', 'RV TYPE= AS CLASSIC 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GUNNING' AND UPPER(first_name) = 'MOLLY/CHUCK') OR LOWER(email_primary) = 'chuck.gunning@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'INGRAM', '', '843 N. FRANKLIN AVE.', 'Palatine', 'IL', '60067', 'ry.ingram@gmail.com', '(630) 397-1001', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'INGRAM' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'ry.ingram@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Susan', 'CHANEY', '', '726 LOUISANNA ST.', 'Lawrence', 'CO', '66044', 'susanchaney@mac.com', '(956) 433-9926', 'RV TYPE= AS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHANEY' AND UPPER(first_name) = 'SUSAN') OR LOWER(email_primary) = 'susanchaney@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'WEIS', '', '1402 ARCADE', 'Goodland', 'KS', '67735', 'ryan_herlchev@hotmail.com', '(785) 728-7465', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEIS' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'ryan_herlchev@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'DUNCAN', '', '46 SUMMERHAVEN LAKE', 'Kearny', 'NE', '68847', 'sbduncan123@gmail.com', '(308) 627-2286', 'RV TYPE= AS INTERSTATE 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUNCAN' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'sbduncan123@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Royce', 'FITTS', '', 'PO BOX 363', 'Gering', 'NE', '69341', 'drfitts@drfitts.com', '(308) 431-2398', 'RV TYPE= R-POD 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FITTS' AND UPPER(first_name) = 'ROYCE') OR LOWER(email_primary) = 'drfitts@drfitts.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Manon', 'MASHBURN', '', '604 7TH ST.', 'New Orleans', 'LA', '70115', 'mmashburn@icloud.com', '(504) 975-2373', 'RV TYPE= AS CARAVEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MASHBURN' AND UPPER(first_name) = 'MANON') OR LOWER(email_primary) = 'mmashburn@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Landon', 'LERWICK', '', '511 CR 4165', 'Lovelady', 'TX', '75851', 'landonlerwick@gmail.com', '(307) 287-1101', 'RV TYPE= KEYSTONE 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LERWICK' AND UPPER(first_name) = 'LANDON') OR LOWER(email_primary) = 'landonlerwick@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Wayne', 'JORGENSEN', '', '3709 BEN CREEK COURT', 'Aledo', 'TX', '76008', 'cl604aviator@msn.com', '(817) 675-4405', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JORGENSEN' AND UPPER(first_name) = 'WAYNE') OR LOWER(email_primary) = 'cl604aviator@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allie', 'CHENEY', '', '3401 WOODFORD DR', 'Arlington', 'TX', '76013', 'allie.cheney@rocketmail.com', '(817) 800-5624', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHENEY' AND UPPER(first_name) = 'ALLIE') OR LOWER(email_primary) = 'allie.cheney@rocketmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'ISBELL', '', 'PO Box 30', 'May', 'TX', '76857', 'bisbell68@gmail.com', '(970) 590-4143', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ISBELL' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'bisbell68@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott Blue', 'VETERAN EVALUATION SERVICES', '', '2707 N LOOP WEST 1000', 'Houston', 'TX', '77008', 'scottblue@maximus.com', '(706) 302-9154', 'WARRANTY WITH MISSION MOBILE MED.  BRAD MCELROY AND BRAD ANDERSON.  SUBMIT ANY REPAIRS TO THEM.  BMCELROY@MISSIONMOBILEMED.COM BANDERSON@MISSIONMOBILEMED.COM LOCKBOX LOCATED BY THE PROPANE TANK.  LEAVE KEY THERE CODE 1776 | Alt email: dennisd@vesservices.com | Alt phone: (254) 449-0859', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VETERAN EVALUATION SERVICES' AND UPPER(first_name) = 'SCOTT BLUE') OR LOWER(email_primary) = 'scottblue@maximus.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eleanor', 'DUTSON', '', '156 RAINBOW DR. #5677', 'Livingston', 'TX', '77399', 'bruwery@yahoo.com', '(616) 283-8037', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUTSON' AND UPPER(first_name) = 'ELEANOR') OR LOWER(email_primary) = 'bruwery@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stephen', 'SUNDERLAND', '', '159 RAINBOW DR.', 'Livingston`', 'TX', '77399', 'steve0546@msn.com', '(651) 295-5386', 'RV TYPE= GD SOLITUDE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SUNDERLAND' AND UPPER(first_name) = 'STEPHEN') OR LOWER(email_primary) = 'steve0546@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eleanor And Mark', 'DOTSON AND BRUSHABER', '', '156 RAINBOW DR #5677', 'Livingston', 'TX', '77399', 'bruwery@yahoo.com', '(419) 371-0293', 'Alt email: eleanorpdotson@gmail.com | Alt phone: (616) 283-8037', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOTSON AND BRUSHABER' AND UPPER(first_name) = 'ELEANOR AND MARK') OR LOWER(email_primary) = 'bruwery@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kathleen', 'FOWLER', '', '1212 17TH ST.', 'Galveston', 'TX', '77550', 'katml42@msn.com', '(720) 339-7091', 'RV TYPE= CHATEAU CLASSIC 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOWLER' AND UPPER(first_name) = 'KATHLEEN') OR LOWER(email_primary) = 'katml42@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'HOYT', '', '5203 THUNDERBIRD', 'Lago Vista', 'TX', '78645', 'jhawkhoyt@yahoo.com', '(512) 500-7782', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOYT' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jhawkhoyt@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zoe', 'KNIGHT', '', '6703 VALLEUTO DR.', 'Austin', 'TX', '78759', 'zknight2016@gmail.com', '(828) 747-2221', 'RV TYPE= KZ ESCAPE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KNIGHT' AND UPPER(first_name) = 'ZOE') OR LOWER(email_primary) = 'zknight2016@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alex', 'DOHERTY', '', '6602 RALSTON ROAD', 'Arvada', 'CO', '80002', 'dohertyculligan@gmail.com', '(330) 814-3721', 'RV TYPE= TRANSIT VAN 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOHERTY' AND UPPER(first_name) = 'ALEX') OR LOWER(email_primary) = 'dohertyculligan@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aaron', 'REX', '', '5837 W. 74TH PLACE', 'Westminster', 'CO', '80003', 'aaronrex73@gmail.com', '(720) 273-4247', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REX' AND UPPER(first_name) = 'AARON') OR LOWER(email_primary) = 'aaronrex73@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David & Kathy', 'SEWOLT', '', '6561 W. 73RD AVE.', 'Arvada', 'CO', '80003', 'ksewolt@q.com', '(303) 420-3406', 'Alt phone: (303) 913-1499', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SEWOLT' AND UPPER(first_name) = 'DAVID & KATHY') OR LOWER(email_primary) = 'ksewolt@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Simon', 'WATKINS', '', '6825 EATON ST.', 'Arvada', 'CO', '80003', 'simonandanita@msn.com', '(720) 244-2212', 'RV TYPE= LANCE 2185', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WATKINS' AND UPPER(first_name) = 'SIMON') OR LOWER(email_primary) = 'simonandanita@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brenda', 'IMBERI', '', '11914 W. 61ST AVE', 'Arvada', 'CO', '80004', 'takintheslowroad@gmail.com', '(303) 906-1699', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'IMBERI' AND UPPER(first_name) = 'BRENDA') OR LOWER(email_primary) = 'takintheslowroad@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Drew', 'LANDIS', '', '6015 CODY ST', 'Arvada', 'CO', '80004', 'boulderpixels@gmail.com', '(303) 885-2812', 'RV TYPE= AS BASECAMP 20X', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LANDIS' AND UPPER(first_name) = 'DREW') OR LOWER(email_primary) = 'boulderpixels@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'YALE', '', '9650 TYLER DR.', 'Arvada', 'CO', '80004', 'mdyale@comcast.net', '(720) 447-8757', 'RV TYPE= DUTCHMAN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YALE' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mdyale@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jennifer', 'ROGERS', '', '1411 W. 58TH PLACE', 'Arvada', 'CO', '80004', 'jenilamb@gmail.com', '(720) 201-7439', 'RV TYPE= LAKOTA CHARGER 8311', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROGERS' AND UPPER(first_name) = 'JENNIFER') OR LOWER(email_primary) = 'jenilamb@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marcia And Mike', 'MALISCH', '', '5985 GARRISON ST.', 'Arvada', 'CO', '80004', 'marciamalisch@comcast.net', '(303) 907-9933', 'RV TYPE= HOLIDAY VESTA/GEORGIE BOY 2002 | Alt phone: (303) 916-0270', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MALISCH' AND UPPER(first_name) = 'MARCIA AND MIKE') OR LOWER(email_primary) = 'marciamalisch@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sally & Tom', 'BLOOM', '', '6139 TAFT COURT', 'Arvada', 'CO', '80004', 'bloombills17@gmail.com', '(316) 206-3700', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BLOOM' AND UPPER(first_name) = 'SALLY & TOM') OR LOWER(email_primary) = 'bloombills17@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ramon', 'TRUJILLO', '', '6105 JANICE WAY', 'Arvada', 'CO', '80004', 'ramon@raymondspaintinginc.com', '(303) 598-0318', 'RV TYPE= JAYCO 27''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TRUJILLO' AND UPPER(first_name) = 'RAMON') OR LOWER(email_primary) = 'ramon@raymondspaintinginc.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shawn', 'HAGGERTY', '', '13758 W. 62ND AVE.', 'Arvada', 'CO', '80004', 'shawnphag1@gmail.com', '(720) 212-4852', 'RV TYPE= KEYSTONE BULLET 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAGGERTY' AND UPPER(first_name) = 'SHAWN') OR LOWER(email_primary) = 'shawnphag1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'CONKLIN', '', '6190 INDEPENDENCE ST', 'Arvada', 'CO', '80004', 'andrewconklingo@gmail.com', '(303) 591-7785', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CONKLIN' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'andrewconklingo@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'KUNK', '', '9856 W 74TH WAY', 'Arvada', 'CO', '80005', 'jasonjameskunk@gmail.com', '(720) 682-4618', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUNK' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jasonjameskunk@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'PAGE', '', '13557 W. 84TH DRIVE', 'Arvada', 'CO', '80005', 'dostpage@yahoo.com', '(720) 988-9007', 'RV TYPE= BUREAS XT 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PAGE' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'dostpage@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kimberlee', 'BARNES', '', '7479 TAFT ST', 'Arvada', 'CO', '80005', 'bbdrkb@aol.com', '(303) 941-3244', 'RV TYPE= AS BAMBI SPORT 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARNES' AND UPPER(first_name) = 'KIMBERLEE') OR LOWER(email_primary) = 'bbdrkb@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerry', 'ABERLE', '', '8436 NELSON COURT', 'Arvada', 'CO', '80005', 'geraldaberle9@gmail.com', '(303) 475-3175', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ABERLE' AND UPPER(first_name) = 'JERRY') OR LOWER(email_primary) = 'geraldaberle9@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dale', 'CLARK', '', '8025 MOORE ST', 'Arvada', 'CO', '80005', '', '(303) 547-6629', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLARK' AND UPPER(first_name) = 'DALE'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chuck', 'TENNANT', '', '8289 ESTES COURT', 'Arvada', 'CO', '80005', 'tenlach@msn.com', '(720) 355-0430', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TENNANT' AND UPPER(first_name) = 'CHUCK') OR LOWER(email_primary) = 'tenlach@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robin', 'SHERMAN', '', '13655 WEST 86TH DRIVE', 'Arvada', 'CO', '80005', 'rshermantx@gmail.com', '(850) 516-8185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHERMAN' AND UPPER(first_name) = 'ROBIN') OR LOWER(email_primary) = 'rshermantx@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'MADRID', '', '11952 W.75TH CIRCLE', 'Arvada', 'CO', '80005', 'gamadrid73@gmail.com', '(505) 320-9643', 'RV TYPE= AS GLOBETROTTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MADRID' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'gamadrid73@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kristopher', 'DAVIS', '', '8461 ALLISON CT.', 'Arvada', 'CO', '80005', 'kldavis984@gmail.com', '(407) 465-0050', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'KRISTOPHER') OR LOWER(email_primary) = 'kldavis984@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Louis', 'CORDOVA', '', '7973 FIELD CT.', 'Arvada', 'CO', '80006', 'speedygonzales55@comcast.net', '(303) 905-0116', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CORDOVA' AND UPPER(first_name) = 'LOUIS') OR LOWER(email_primary) = 'speedygonzales55@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Babur', 'SIDDIGNE', '', '7295 NILE ST.', 'Arvada', 'CO', '80007', 'babur_s@hotmail.com', '(512) 695-3707', 'RV TYPE= WINNEBAGO VIEW', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SIDDIGNE' AND UPPER(first_name) = 'BABUR') OR LOWER(email_primary) = 'babur_s@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Neil', 'BARTEL', '', '16588 W 69TH CIRCLE', 'Arvada', 'CO', '80007', 'neilmbartel@gmail.com', '(303) 908-5949', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARTEL' AND UPPER(first_name) = 'NEIL') OR LOWER(email_primary) = 'neilmbartel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Roy', 'METZE', '', '18426 W. 83RD DR.', 'Arvada', 'CO', '80007', 'roymit@outlook.com', '(303) 519-3236', 'RV TYPE= IMAGINE TT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'METZE' AND UPPER(first_name) = 'ROY') OR LOWER(email_primary) = 'roymit@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Falon', 'BROADHEAD', '', '8355 EATON WAY', 'Arvada', 'CO', '80007', 'falon.broadhead@gmail.com', '(978) 394-5209', 'RV TYPE= AS FC 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BROADHEAD' AND UPPER(first_name) = 'FALON') OR LOWER(email_primary) = 'falon.broadhead@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'COLE', '', '15873 W. 66TH CIRCLE', 'Arvada', 'CO', '80007', 'mtnboy44@gmail.com', '(303) 523-5854', 'RV TYPE= AS GLOBETROTTER NO: 70045 R/O: Dec 7 2023 - 13:58 ID: 1 ******************** NO: 70045 R/O: Dec 7 2023 - 13:59 ID: 1 ******************** NO: 70045 R/O: Dec 7 2023 - 14:00 ID: 1 ******************** | Alt phone: (303) 502-7607', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLE' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'mtnboy44@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anthony', 'RODRIGUEZ', '', '1297 DALLAS ST', 'Aurora', 'CO', '80010', 'anthony.rodriguez1026@gmail.com', '(917) 659-1021', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RODRIGUEZ' AND UPPER(first_name) = 'ANTHONY') OR LOWER(email_primary) = 'anthony.rodriguez1026@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Virginia', 'FRAZER-ABEL', '', '10399 E. 25TH DRIVE', 'Aurora', 'CO', '80010', 'frazerabelfamily@gmail.com', '(303) 320-0654', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRAZER-ABEL' AND UPPER(first_name) = 'VIRGINIA') OR LOWER(email_primary) = 'frazerabelfamily@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Talon', 'LABREC', '', '10891 E. LOWRY PLACE', 'Aurora', 'CO', '80010', 'talonlabrec@hotmail.com', '(615) 635-7989', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LABREC' AND UPPER(first_name) = 'TALON') OR LOWER(email_primary) = 'talonlabrec@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rod', 'BURNS', '', '2101 EAGLE CIRCLE', 'Aurora', 'CO', '80010', 'rkeb@comcast.net', '(303) 887-8565', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURNS' AND UPPER(first_name) = 'ROD') OR LOWER(email_primary) = 'rkeb@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry', 'VARGAS', '', '19125 E CARMEL CIRCLE', 'Aurora', 'CO', '80011', '303milehighrider@gmail.com', '(720) 231-9408', 'Alt phone: (720) 357-8159', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VARGAS' AND UPPER(first_name) = 'LARRY') OR LOWER(email_primary) = '303milehighrider@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carrie', 'MASARIK', '', '18688 E. 17TH AVE.', 'Aurora', 'CO', '80011', 'carriemasarik@gmail.com', '(720) 629-4589', 'RV TYPE= FLAGSTAFF 627D', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MASARIK' AND UPPER(first_name) = 'CARRIE') OR LOWER(email_primary) = 'carriemasarik@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cole', 'SCHARA', '', '828 IDALIA ST', 'Aurora', 'CO', '80011', 'coleschara@gmail.com', '(720) 926-1428', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHARA' AND UPPER(first_name) = 'COLE') OR LOWER(email_primary) = 'coleschara@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'PATRICK', '', '16051 E. COLFAX', 'Aurora', 'CO', '80011', 'jimmy.patrick@readyfleet.com', '', 'Alt phone: (303) 917-8004', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PATRICK' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jimmy.patrick@readyfleet.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sergio & Norma', 'RUVALCABA', '', '1957 ALTURA BLVD', 'Aurora', 'CO', '80011', 'sergioalodanii@hotmail.com', '(720) 422-7138', 'Alt phone: (720) 492-5664', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUVALCABA' AND UPPER(first_name) = 'SERGIO & NORMA') OR LOWER(email_primary) = 'sergioalodanii@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'EVANS', '', '19764 E BATAVIA DR', 'Aurora', 'CO', '80011', 'ge420@comcast.net', '(303) 877-3736', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EVANS' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'ge420@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'BUEHMANN', 'AURORA PUBLIC SCHOOLS', '15700 E 1ST AVE.', 'Aurora', 'CO', '80011', 'jdbuehmann@aurorak12.org', '(720) 331-9249', 'NO: 70160 R/O: Oct 14 2024 - 10:04 ID: 1 ********************', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUEHMANN' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'jdbuehmann@aurorak12.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carlos', 'ROMARO', '', '1251 S. KITTRIDGE STEET', 'Aurora', 'CO', '80011', 'bidogrooter01@gmail.com', '(720) 219-4777', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROMARO' AND UPPER(first_name) = 'CARLOS') OR LOWER(email_primary) = 'bidogrooter01@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'HOLMBERG', '', '14333 E 1ST DR #205', 'Aurora', 'CO', '80011', 'dholmb@gmail.com', '(507) 381-3781', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLMBERG' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'dholmb@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'SINGLETARY', '', '1028 DEARBORN ST', 'Aurora', 'CO', '80011', 'mckymac@hotmail.com', '(303) 726-3679', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SINGLETARY' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mckymac@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Charles', 'MANGUS', '', '17471 E. 18TH PLACE', 'Aurora', 'CO', '80011', 'manguscmangus@aol.com', '(720) 518-3382', 'Alt email: zachary.wiseman@ngic.com | Alt phone: (720) 859-7332', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MANGUS' AND UPPER(first_name) = 'CHARLES') OR LOWER(email_primary) = 'manguscmangus@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Soledad', 'RAMIREZ', '', '19115 E. CARMEL CIRCLE', 'Aurora', 'CO', '80011', 'sol.87@live.com', '(720) 404-4471', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAMIREZ' AND UPPER(first_name) = 'SOLEDAD') OR LOWER(email_primary) = 'sol.87@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alonzo', 'ESPINOZA', '', '651 SALIDA WAY', 'Aurora', 'CO', '80011', 'alonzoespinoza@msn.com', '(303) 921-1330', 'RV TYPE= CONNECT 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPINOZA' AND UPPER(first_name) = 'ALONZO') OR LOWER(email_primary) = 'alonzoespinoza@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Share', 'LEE', '', '13410 E. 7TH AVE.', 'Aurora', 'CO', '80011', 'share.lee@yahoo.com', '(303) 888-2338', 'RV TYPE= FREEDOM EXPRESS 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEE' AND UPPER(first_name) = 'SHARE') OR LOWER(email_primary) = 'share.lee@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cesar', 'SOLIS', '', '12558 E KENTUCKY AVE', 'Aurora', 'CO', '80012', 'pishishe@gmail.com', '(720) 601-8957', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SOLIS' AND UPPER(first_name) = 'CESAR') OR LOWER(email_primary) = 'pishishe@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Myles', 'WHITSETT', '', '11576 E. BAYAUD DR.', 'Aurora', 'CO', '80012', 'myleswhitsett@gmail.com', '(720) 838-3322', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITSETT' AND UPPER(first_name) = 'MYLES') OR LOWER(email_primary) = 'myleswhitsett@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mary', 'ZIUS', '', '11759 E. ARKANSAS AVE.', 'Aurora', 'CO', '80012', 'mzius@comcast.net', '(720) 951-1644', 'RV TYPE= GD REFLECTION 33''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIUS' AND UPPER(first_name) = 'MARY') OR LOWER(email_primary) = 'mzius@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dustin', 'GOODWIN', '', '12318 E CEDAR CIRCLE', 'Aurora', 'CO', '80012', 'dustingoodwin@gmail.com', '(720) 415-7571', 'Alt email: awnings@lci1.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOODWIN' AND UPPER(first_name) = 'DUSTIN') OR LOWER(email_primary) = 'dustingoodwin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nick', 'BICHANICH', '', '12954 E CENTER AVE.', 'Aurora', 'CO', '80012', 'nicbic87@gmail.com', '(262) 366-5307', 'Alt phone: (708) 218-3669', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BICHANICH' AND UPPER(first_name) = 'NICK') OR LOWER(email_primary) = 'nicbic87@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Doug', 'CLARKE', '', '3749 S. YAMPA ST.', 'Aurora', 'CO', '80013', 'dougclarke4@gmail.com', '(720) 833-1166', 'RV TYPE= FLEETWOOD 2000', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLARKE' AND UPPER(first_name) = 'DOUG') OR LOWER(email_primary) = 'dougclarke4@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gerry & Marilyn', 'SETH', '', '2961 S. ZENO WAY', 'Aurora', 'CO', '80013', 'marilynseth@gmail.com', '(618) 466-8546', 'Alt email: leeann@dcinsurers.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SETH' AND UPPER(first_name) = 'GERRY & MARILYN') OR LOWER(email_primary) = 'marilynseth@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dean', 'MADDAMMA', '', '19012 E. DATMOUTH AVE.', 'Aurora', 'CO', '80013', 'ou4920@gmail.com', '(720) 560-1941', 'RV TYPE= JAYCO JAYFLIGHT 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MADDAMMA' AND UPPER(first_name) = 'DEAN') OR LOWER(email_primary) = 'ou4920@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Randy', 'REISS', '', '17721 E. HAMILTON CIRCLE  APT 313', 'Aurora', 'CO', '80013', 'randyreiss1955@gmail.com', '(319) 795-7219', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REISS' AND UPPER(first_name) = 'RANDY') OR LOWER(email_primary) = 'randyreiss1955@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'GALLEGOS', '', '20482 E MANSFIELD PLACE', 'Aurora', 'CO', '80013', 'harleyridin@live.com', '(303) 562-6279', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GALLEGOS' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'harleyridin@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'JAKL', '', '2269 S. LEWISTON ST.', 'Aurora', 'CO', '80013', 'mikejakl@yahoo.com', '(303) 550-6477', 'RV TYPE= JAYCO OCTANE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JAKL' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mikejakl@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'DIXON', '', '2536 S PAGOSA ST', 'Aurora', 'CO', '80013', 'dixondaniel05@outlook.com', '(303) 619-0307', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DIXON' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'dixondaniel05@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jamie', 'RAMIREZ', '', '19213 E. ADRIATIC PLACE', 'Aurora', 'CO', '80013', 'jdklatka@yahoo.com', '(720) 217-7141', 'RV TYPE= FR CHEROKEE 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAMIREZ' AND UPPER(first_name) = 'JAMIE') OR LOWER(email_primary) = 'jdklatka@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Elizabeth', 'AYALA', '', '3243 S. RICHFIELD ST.', 'Aurora', 'CO', '80013', 'eayala62@yahoo.com', '(303) 475-2144', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AYALA' AND UPPER(first_name) = 'ELIZABETH') OR LOWER(email_primary) = 'eayala62@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amanda', 'JAKL', '', '2269 S. LEWISTON ST.', 'Aurora', 'CO', '80013', 'ajakl@mac.com', '(303) 548-4331', 'RV TYPE= JAYCO OCTANE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JAKL' AND UPPER(first_name) = 'AMANDA') OR LOWER(email_primary) = 'ajakl@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stephen', 'RUPP', '', '15100 E. GREENWOOD PLACE', 'Aurora', 'CO', '80014', 'sbr3d@yahoo.com', '(303) 513-4729', 'RV TYPE= PHOENIX CRUISER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUPP' AND UPPER(first_name) = 'STEPHEN') OR LOWER(email_primary) = 'sbr3d@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carl', 'RUSSELL', '', '13961 E. MARINA DR. #605', 'Aurora', 'CO', '80014', 'ruslcart@icloud.com', '(719) 338-2404', 'RV TYPE= AS GT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUSSELL' AND UPPER(first_name) = 'CARL') OR LOWER(email_primary) = 'ruslcart@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Duke [Clarence]', 'HARRIS', '', '13991 E. MARINA DR.', 'Aurora', 'CO', '80014', 'harrco@yahoo.com', '(303) 596-4721', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARRIS' AND UPPER(first_name) = 'DUKE [CLARENCE]') OR LOWER(email_primary) = 'harrco@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'WETHINGTON', '', '2874 S. OAKLAND CIRCLE', 'Aurora', 'CO', '80014', 'marcwethington@gmail.com', '(850) 766-9954', 'RV TYPE= KEYSTONE PASSPORT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WETHINGTON' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'marcwethington@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lee', 'FULKS', '', '13609 E CORNELL AVE', 'Aurora', 'CO', '80014', 'leful2@msn.com', '(720) 838-4564', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FULKS' AND UPPER(first_name) = 'LEE') OR LOWER(email_primary) = 'leful2@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jessie', 'HOPKINS', '', '10700 E. DARTMOUTH AVE.  #112', 'Aurora', 'CO', '80014', 'jessie.hopkins77@gmail.com', '(720) 621-8567', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOPKINS' AND UPPER(first_name) = 'JESSIE') OR LOWER(email_primary) = 'jessie.hopkins77@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Natasha', 'GONZALEZ', '', '2396 S DAWSON WAY', 'Aurora', 'CO', '80014', 'ayala.natasha@gmail.com', '(720) 628-9110', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GONZALEZ' AND UPPER(first_name) = 'NATASHA') OR LOWER(email_primary) = 'ayala.natasha@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'SMITH', '', '5442 S. CATHAY WAY', 'Centennial', 'CO', '80015', 'bssmith@aol.com', '(303) 919-9708', 'RV TYPE= FR PUMA 20', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'bssmith@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Audrey & Brett', 'WELLERS & BEGGS', '', '4332 S. HIMALAYA CIR.', 'Aurora', 'CO', '80015', 'brett.wellers@gmail.com', '(720) 917-4044', 'AVERAGE RETAIL= $4650 | Alt email: ajbeggs89@gmail.com | Alt phone: (303) 725-7710', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WELLERS & BEGGS' AND UPPER(first_name) = 'AUDREY & BRETT') OR LOWER(email_primary) = 'brett.wellers@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eldon', 'FREW', '', '4465 S. ANDES WAY', 'Aurora', 'CO', '80015', 'clair@cfrew.us', '(303) 419-5425', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FREW' AND UPPER(first_name) = 'ELDON') OR LOWER(email_primary) = 'clair@cfrew.us');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Peter', 'BARZEN', '', '13994 E. GRAND AVE.', 'Aurora', 'CO', '80015', 'peterbarzen@yahoo.com', '(720) 987-7944', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARZEN' AND UPPER(first_name) = 'PETER') OR LOWER(email_primary) = 'peterbarzen@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'SCHAEFFER', '', '22403 E. MAPLEWOOD LANE', 'Aurora', 'CO', '80015', 'seeh4@comcast.net', '(720) 255-3694', 'RV TYPE= LANCE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHAEFFER' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'seeh4@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'CASTERLINE', '', '19332 E BERRY PL', 'Aurora', 'CO', '80015', 'casterlinej@gmail.com', '(303) 827-1993', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CASTERLINE' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'casterlinej@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'PORTER', '', '20362 E. QUINCY  PL.', 'Aurora', 'CO', '80015', 'christianporter@live.com', '(720) 988-4006', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PORTER' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'christianporter@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Todd, Mary', 'YOGERST', '', '4388 S. GRANBY WAY', 'Aurora', 'CO', '80015', 'toddyogi@icloud.com', '(303) 285-3234', 'DECIDED ON HAVING SOMEONE ELSE DO THE WORK | Alt phone: (720) 448-8570', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YOGERST' AND UPPER(first_name) = 'TODD, MARY') OR LOWER(email_primary) = 'toddyogi@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'KUNZ', '', '24781 E. ROWLAND PLACE', 'Aurora', 'CO', '80016', 'richiebk79@yahoo.com', '(720) 207-8334', 'Alt email: awhitk@yahoo.com | Alt phone: (720) 207-8333', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUNZ' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'richiebk79@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'HEISTERMANN', '', '22841 E. BRIARWOOD PLACE', 'Aurora', 'CO', '80016', 'rheist45@gmail.com', '(303) 819-4830', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HEISTERMANN' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'rheist45@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'PETERSEN', '', '25262 E. GLASGOW PLACE', 'Aurora', 'CO', '80016', 'ryankpetersen@yahoo.com', '(303) 919-8388', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PETERSEN' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'ryankpetersen@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'RIVERA', '', '25150 E OTTAWA DR', 'Aurora', 'CO', '80016', 'mikerivera1@hotmail.com', '(724) 971-0293', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIVERA' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mikerivera1@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'LUCKNER', '', '23540 E. SWALLOW CIRCLE', 'Aurora', 'CO', '80016', 'bob_luckner@yahoo.com', '(303) 809-5942', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUCKNER' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'bob_luckner@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'William', 'CHISHOLM', '', '21829 E. DAVIES CIRCLE', 'Centennial', 'CO', '80016', 'wjchisholm@gmail.com', '(928) 821-5699', 'RV TYPE= THOR 29 G 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHISHOLM' AND UPPER(first_name) = 'WILLIAM') OR LOWER(email_primary) = 'wjchisholm@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'REIMERS', '', '18150 E. CALEY CIRCLE', 'Aurora', 'CO', '80016', 'p_reimers@msn.com', '(720) 325-9758', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REIMERS' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'p_reimers@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'DUNHAM', '', '6492 S. MILLBROOK WAY', 'Aurora', 'CO', '80016', 'david_d_dunham@yahoo.com', '', 'RV TYPE= TITAN SUNNY BROOK', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUNHAM' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'david_d_dunham@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa & Bryan', 'CARBOL', '', '5311 S EATON PARK WAY', 'Aurora', 'CO', '80016', 'blcarbol@msn.com', '(505) 452-7566', 'Alt email: lisacarbol@gmail.com | Alt phone: (505) 452-7400', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARBOL' AND UPPER(first_name) = 'LISA & BRYAN') OR LOWER(email_primary) = 'blcarbol@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sue & Darrald', 'BARAJAS', '', '6632 S. KEWAUNE WAY', 'Aurora', 'CO', '80016', 'barajassue@ymail.com', '(720) 284-2924', 'Alt email: william.bobbitt.vabcmk@statefarm.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARAJAS' AND UPPER(first_name) = 'SUE & DARRALD') OR LOWER(email_primary) = 'barajassue@ymail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Barb', 'PUTNAM', '', '23746 E. GRAND PLACE', 'Aurora', 'CO', '80016', 'kwgrlqt@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PUTNAM' AND UPPER(first_name) = 'BARB') OR LOWER(email_primary) = 'kwgrlqt@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'TERRELL', '', '6032 S LITTLE RIVER CT', 'Aurora', 'CO', '80016', 'george_terrell5413@yahoo.com', '(501) 352-6775', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TERRELL' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'george_terrell5413@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mario', 'MONTEALEGRE', '', '25030 E. OTTAWA DR.', 'Aurora', 'CO', '80016', 'mmontealq@gmail.com', '(303) 517-4282', 'RV TYPE= AS GLOBETROTTER 23FB', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTEALEGRE' AND UPPER(first_name) = 'MARIO') OR LOWER(email_primary) = 'mmontealq@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amanda', 'SCHAEFFER', '', '', '', '', '80016', 'schaefferamanda@hotmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHAEFFER' AND UPPER(first_name) = 'AMANDA') OR LOWER(email_primary) = 'schaefferamanda@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andy', 'SENKO', '', '7735 WINNIPEG ST.  #1015', 'Aurora', 'CO', '80016', 'bandas2021@gmail.com', '(505) 514-5443', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SENKO' AND UPPER(first_name) = 'ANDY') OR LOWER(email_primary) = 'bandas2021@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Oleg', 'STARCHAK', '', '7251 S QUINTERO ST', 'Aurora', 'CO', '80016', 'horizont_1@msn.com', '(206) 409-8987', 'NO: 70125 R/O: Sep 17 2024 - 15:38 ID: 1 ******************** | Alt email: jmminsurance4u@allstate.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STARCHAK' AND UPPER(first_name) = 'OLEG') OR LOWER(email_primary) = 'horizont_1@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shane', 'HUNT', '', '5623 S COOLIDGE COURT', 'Aurora', 'CO', '80016', 'shane@rocksolidbuilding.net', '(720) 291-7767', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUNT' AND UPPER(first_name) = 'SHANE') OR LOWER(email_primary) = 'shane@rocksolidbuilding.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Charlie', 'VIGIL', '', '25349 E. COSTILLA PLACE', 'Aurora', 'CO', '80016', 'cvigil1@gmail.com', '(720) 934-1907', 'RV TYPE= FR COACHMAN 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VIGIL' AND UPPER(first_name) = 'CHARLIE') OR LOWER(email_primary) = 'cvigil1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Roger/Leatha', 'KINNEY', '', '1373 S. ZENO ST.', 'Aurora', 'CO', '80017', 'rlkin@comcast.net', '(303) 548-2973', 'RV TYPE= JAYCO 24', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KINNEY' AND UPPER(first_name) = 'ROGER/LEATHA') OR LOWER(email_primary) = 'rlkin@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kathy', 'DASILVA', '', '15703 E. GUNNISON PLACE', 'Aurora', 'CO', '80017', 'kathryn.adney@gmail.com', '(720) 260-3723', 'RV TYPE= KEYSTONE LAREDO 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DASILVA' AND UPPER(first_name) = 'KATHY') OR LOWER(email_primary) = 'kathryn.adney@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jarod', 'HEIN', '', '1324 S. ENSENADA ST.', 'Aurora', 'CO', '80017', 'jehdfd@gmail.com', '(720) 308-0045', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HEIN' AND UPPER(first_name) = 'JAROD') OR LOWER(email_primary) = 'jehdfd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven', 'EBERTOWSKI', '', '998 S. SALIDA ST.', 'Aurora', 'CO', '80017', 'steven.ebertowski@gmail.com', '(720) 908-0859', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EBERTOWSKI' AND UPPER(first_name) = 'STEVEN') OR LOWER(email_primary) = 'steven.ebertowski@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'WALKER', '', '1667 S. WALDEN CT.', 'Aurora', 'CO', '80017', 'mtothekw@hotmail.com', '(408) 890-8082', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WALKER' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mtothekw@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerel', 'BLAKELY', '', '17982 E. GUNNISON PLACE', 'Aurora', 'CO', '80017', 'blakely21@comcast.net', '(303) 337-6861', 'RV TYPE= AEROLITE TT 2007', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BLAKELY' AND UPPER(first_name) = 'JEREL') OR LOWER(email_primary) = 'blakely21@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christian', 'HILL', '', '17504 E KEYSTONE CIRCLE S UNIT C', 'Aurora', 'CO', '80017', 'midgardrentals@gmail.com', '(520) 609-2960', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HILL' AND UPPER(first_name) = 'CHRISTIAN') OR LOWER(email_primary) = 'midgardrentals@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carlos', 'ROMERO', '', '1251 S. KITTRIDGE ST', 'Aurora', 'CO', '80017', 'bigdogrooter01@gmail.com', '(720) 219-4777', 'Alt phone: (720) 841-4328', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROMERO' AND UPPER(first_name) = 'CARLOS') OR LOWER(email_primary) = 'bigdogrooter01@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jimmy & Linda', 'GARRETT', '', '1314 S. IDALIA ST.', 'Aurora', 'CO', '80017', 'starfishscuba@aol.com', '(720) 416-4885', 'RV TYPE= AS CARAVEL 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARRETT' AND UPPER(first_name) = 'JIMMY & LINDA') OR LOWER(email_primary) = 'starfishscuba@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'KNOBLOCK', '', '240 S IDER WAY', 'Aurora', 'CO', '80018', 'trkblock@gmail.com', '(303) 532-9063', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KNOBLOCK' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'trkblock@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Al', 'DYCK', '', '15755 E ABERDEEN AVE.', 'Aurora', 'CO', '80018', 'albert.dyck@hotmail.com', '(303) 884-2675', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DYCK' AND UPPER(first_name) = 'AL') OR LOWER(email_primary) = 'albert.dyck@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'SEILER', '', '532 N. JACKSON GAP WAY', 'Aurora', 'CO', '80018', 'thepoolguy@gmail.com', '(720) 985-7374', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SEILER' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'thepoolguy@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rodney', 'TAYLOR', '', '24420 E 2ND PLACE', 'Aurora', 'CO', '80018', 'r1729pt@yahoo.com', '(316) 285-3419', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAYLOR' AND UPPER(first_name) = 'RODNEY') OR LOWER(email_primary) = 'r1729pt@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'STEGALL', '', '23831 E ALABAMA DR.', 'Aurora', 'CO', '80018', 'robshellystegall@gmail.com', '(702) 401-1863', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEGALL' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'robshellystegall@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicholas', 'GOODFELLOW', '', '611 N ROME ST', 'Aurora', 'CO', '80018', 'nickgoodfellow92@gmail.com', '(970) 232-8439', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOODFELLOW' AND UPPER(first_name) = 'NICHOLAS') OR LOWER(email_primary) = 'nickgoodfellow92@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lance', 'WEBER', '', '1817 S. BUCHANAN CIRCLE', 'Aurora', 'CO', '80018', 'lanceweber123@gmail.com', '(605) 423-6012', 'RV TYPE= KZ SPORTSMAN 5-W 2007', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEBER' AND UPPER(first_name) = 'LANCE') OR LOWER(email_primary) = 'lanceweber123@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Omar', 'ESPIN', '', '21100 E 11TH AVE.', 'Aurora', 'CO', '80018', 'omarespin17@gmail.com', '(303) 887-1745', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPIN' AND UPPER(first_name) = 'OMAR') OR LOWER(email_primary) = 'omarespin17@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allen', 'ESLINGER', '', '951 N. VANDRIVER WAY', 'Aurora', 'CO', '80018', 'awe0017@gmail.com', '(316) 494-0685', 'RV TYPE= JAYCO REDHAWK 26XD 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESLINGER' AND UPPER(first_name) = 'ALLEN') OR LOWER(email_primary) = 'awe0017@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Glenn', 'RUSSELL', '', '5059 N QUEMOY COURT', 'Aurora', 'CO', '80019', 'glnrs159@gmail.com', '(757) 641-2333', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUSSELL' AND UPPER(first_name) = 'GLENN') OR LOWER(email_primary) = 'glnrs159@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Abe', 'ATENCIO', '', '13234 SHADOW CANYON TRAIL', 'Broomfield', 'CO', '80020', 'abe02@yahoo.com', '(303) 921-4322', 'RV TYPE= ROCKWOOD MINI LITE 2012', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ATENCIO' AND UPPER(first_name) = 'ABE') OR LOWER(email_primary) = 'abe02@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alicia', 'HAHN', '', '12643 GROVE ST.', 'Broomfield', 'CO', '80020', 'alicia.k.hahn@gmail.com', '(720) 938-0107', 'RV TYPE= FLEETWOOD FLAIR LXE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAHN' AND UPPER(first_name) = 'ALICIA') OR LOWER(email_primary) = 'alicia.k.hahn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Graham', 'DOUGLAS', '', '12203 WOLFF DR.', 'Broomfield', 'CO', '80020', 'g.m.douglas77@gmail.com', '(303) 746-3336', 'RV TYPE= FR MICRO LITE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOUGLAS' AND UPPER(first_name) = 'GRAHAM') OR LOWER(email_primary) = 'g.m.douglas77@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Randy', 'MAEZ', '', '12640 UTICA CIRCLE', 'Broomfield', 'CO', '80020', 'randy@randymaezlive.com', '(303) 808-5305', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAEZ' AND UPPER(first_name) = 'RANDY') OR LOWER(email_primary) = 'randy@randymaezlive.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'MURROW', '', '2030 POWDERHORN TRAIL', 'Broomfield', 'CO', '80020', 'gregmurrow@aol.com', '(303) 229-7300', 'RV TYPE= SPRINTER PLEASUREWAY CLASS B 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURROW' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gregmurrow@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'MARTINEZ', '', '4124 BRANDON AVE.', 'Broomfield', 'CO', '80020', 'dmrt120@gmail.com', '(720) 201-1907', 'RV TYPE= KEYSTONE PASSPORT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTINEZ' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'dmrt120@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marc', 'ROSEFSKY', '', '835 MESALT', 'Broomfield', 'CO', '80020', 'marcrosefsky@gmail.com', '', 'RV TYPE= B TOURING CRUISER 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROSEFSKY' AND UPPER(first_name) = 'MARC') OR LOWER(email_primary) = 'marcrosefsky@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'NEWMAN', '', '5594 W. 96TH PLACE', 'Broomfield', 'CO', '80020', 'grezlik@hotmail.com', '(802) 999-4185', 'RV TYPE= AS SAFARI 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NEWMAN' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'grezlik@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'GROSNICK', '', '12576 MARIA CIRCLE', 'Broomfield', 'CO', '80020', 'garyg@grosnick.com', '(303) 219-0112', 'RV TYPE= CHEROKEE WOLF PUP', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GROSNICK' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'garyg@grosnick.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kitty', 'ROBB', '', '1109 HIGHLAND PARK DR.', 'Broomfield', 'CO', '80020', 'allegar5@yahoo.com', '(720) 220-1446', 'RV TYPE= TIFFIN WAYFARER 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROBB' AND UPPER(first_name) = 'KITTY') OR LOWER(email_primary) = 'allegar5@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Philip & Linda', 'CANGILLA', '', '110 FAIRPLAY AVE', 'Broomfield', 'CO', '80020', 'philip.cangilla@blueflo.com', '(303) 330-7025', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CANGILLA' AND UPPER(first_name) = 'PHILIP & LINDA') OR LOWER(email_primary) = 'philip.cangilla@blueflo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Savannah', 'SWITZER', '', '13401 ALCOTT WAY', 'Broomfield', 'CO', '80020', 'savannahswitzer2@gmail.com', '(314) 757-1690', 'RV TYPE= AS BAMBI 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SWITZER' AND UPPER(first_name) = 'SAVANNAH') OR LOWER(email_primary) = 'savannahswitzer2@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allard', 'TEEPLE', '', '1055 JADE ST.', 'Broomfield', 'CO', '80020', 'teepleal@gmail.com', '(313) 415-2009', 'RV TYPE= AS BASECAMP 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TEEPLE' AND UPPER(first_name) = 'ALLARD') OR LOWER(email_primary) = 'teepleal@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Craig', 'HUMPHREY', '', '190 W 3RD AVE DR', 'Broomfield', 'CO', '80020', 'craigumpy@q.com', '(720) 726-0262', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUMPHREY' AND UPPER(first_name) = 'CRAIG') OR LOWER(email_primary) = 'craigumpy@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rebecca & Dave', 'LENOBLE', '', '3237 WILL AVE PLACE', 'Broomfield', 'CO', '80020', 'junai4all@gmail.com', '(303) 476-0697', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LENOBLE' AND UPPER(first_name) = 'REBECCA & DAVE') OR LOWER(email_primary) = 'junai4all@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'TAYLOR', '', '221 MONARCH TRAIL', 'Broomfield', 'CO', '80020', 'davidtaylor.geo@gmail.com', '(303) 819-6913', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAYLOR' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'davidtaylor.geo@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'KIRGAN', '', '433 OURAY AVE', 'Broomfield', 'CO', '80020', 'cakirgan27@gmail.com', '(720) 645-9336', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KIRGAN' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'cakirgan27@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brenda', 'ALBERT', '', '3170 S. PRINCESS CIRCLE', 'Broomfield', 'CO', '80020', 'blalbert2002@yahoo.com', '(303) 408-7321', 'RV TYPE= FLAGSTAFF SHAMROCK', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ALBERT' AND UPPER(first_name) = 'BRENDA') OR LOWER(email_primary) = 'blalbert2002@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'SWALLEY', '', '3421 W 131ST AVE.', 'Broomfield', 'CO', '80020', 'jrswalley@yahoo.com', '(206) 384-8060', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SWALLEY' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jrswalley@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Didi', 'MOYER', '', '13660 VIA VARRA #412', 'Broomfield', 'CO', '80020', 'winter_babylove@yahoo.com', '(360) 470-8823', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOYER' AND UPPER(first_name) = 'DIDI') OR LOWER(email_primary) = 'winter_babylove@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Art/Donna', 'MAHAGAN', '', '3136 W. 134TH CT', 'Broomfield', 'CO', '80020', 'dmahagan@thkassoc.com', '(720) 939-2156', 'RV TYPE= GD IMAGINE 26''  $150 DEDUCTIBLE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAHAGAN' AND UPPER(first_name) = 'ART/DONNA') OR LOWER(email_primary) = 'dmahagan@thkassoc.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'JILES', '', '10967 W. 100TH WAY', 'Broomfield', 'CO', '80021', 'bobjiles@gmail.com', '(303) 437-8693', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JILES' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'bobjiles@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Meredith', 'KAISER', '', '1781 W. 55TH PLACE', 'Broomfield', 'CO', '80021', 'meredith.l.kaiser@gmail.com', '(303) 518-4217', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KAISER' AND UPPER(first_name) = 'MEREDITH') OR LOWER(email_primary) = 'meredith.l.kaiser@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kathryn', 'ARCHER', '', '9293 W. 98TH WAY', 'Westminster', 'CO', '80021', 'faery_penguin@yahoo.com', '(720) 345-9445', 'RV TYPE= KEYSTONE PASSPORT 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARCHER' AND UPPER(first_name) = 'KATHRYN') OR LOWER(email_primary) = 'faery_penguin@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gladys', 'ORONA', '', '10447 INDEPENDENCE ST', 'Westminster', 'CO', '80021', 'orona.g@gmail.com', '(308) 672-1807', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ORONA' AND UPPER(first_name) = 'GLADYS') OR LOWER(email_primary) = 'orona.g@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ty', 'SALT', '', '12782 E 105TH AVE', 'Commerce City', 'CO', '80022', 'wrestler1859@gmail.com', '(928) 266-6911', 'Alt email: multilinesupplements@geico.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SALT' AND UPPER(first_name) = 'TY') OR LOWER(email_primary) = 'wrestler1859@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'BRAILSFORD', '', '13950 E. 104TH DR.', 'Commerce City', 'CO', '80022', 'rickbrailsford@icloud.com', '(303) 601-0541', 'RV TYPE= SPRINTER 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRAILSFORD' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'rickbrailsford@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'WERA', '', '16752 PARKSIDE DR.', 'Commerce City', 'CO', '80022', 'billwera@gmail.com', '(608) 239-6972', 'RV TYPE= OPEN RANGE ULTRA LITE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WERA' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'billwera@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'COTIE', '', '9872 JASPER DR', 'Commerce City', 'CO', '80022', 'bcotie_2000@yahoo.com', '(303) 668-1692', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COTIE' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'bcotie_2000@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Camron', 'STALLINGS', '', '10760 WACO ST.', 'Commerce City', 'CO', '80022', 'camronstallings5@gmail.com', '(812) 661-0421', 'OWNED BY STEPHANIE SALMON - 719-306-5656', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STALLINGS' AND UPPER(first_name) = 'CAMRON') OR LOWER(email_primary) = 'camronstallings5@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe David', 'PENA, JR', '', '18034 E 107TH PLACE', 'Commerce City', 'CO', '80022', 'davepenajr@outlook.com', '(210) 548-0099', 'Alt email: randall.stanton@agilitihealth.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PENA, JR' AND UPPER(first_name) = 'JOE DAVID') OR LOWER(email_primary) = 'davepenajr@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Garrett', 'CASS', '', '', 'Commerce City', 'CO', '80022', 'garrett.b.cass@aol.com', '(310) 429-7322', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CASS' AND UPPER(first_name) = 'GARRETT') OR LOWER(email_primary) = 'garrett.b.cass@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patricia', 'DELEON', '', '10578 OURAY', 'Commerce City', 'CO', '80022', 'mybelovedismine@yahoo.com', '(720) 431-2387', 'RV TYPE= MAJESTIC 19''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DELEON' AND UPPER(first_name) = 'PATRICIA') OR LOWER(email_primary) = 'mybelovedismine@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Danny', 'CRAM', '', '10240 POTOMAC ST.', 'Commerce City', 'CO', '80022', 'dlcram@msn.com', '(303) 588-8838', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CRAM' AND UPPER(first_name) = 'DANNY') OR LOWER(email_primary) = 'dlcram@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Phllip', 'GOMEZ', '', '5861 DEMOTT AVE', 'Commerce City', 'CO', '80022', 'janelle.gomez@outlook.com', '(303) 587-8028', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOMEZ' AND UPPER(first_name) = 'PHLLIP') OR LOWER(email_primary) = 'janelle.gomez@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brent', 'FENIMORE', '', '11445 KITTRIDGE ST', 'Commerce City', 'CO', '80022', 'bkcfenimore@gmail.com', '(303) 210-4643', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FENIMORE' AND UPPER(first_name) = 'BRENT') OR LOWER(email_primary) = 'bkcfenimore@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Randy Hubbard', 'MICHELLE HAHN', '', '17067 E. 106TH AVE.', 'Commerce City', 'CO', '80022', 'miccihahn@gmail.com', '(303) 507-8393', 'Alt phone: (303) 590-5950', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MICHELLE HAHN' AND UPPER(first_name) = 'RANDY HUBBARD') OR LOWER(email_primary) = 'miccihahn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ervin', 'RUIZ', '', '9606 LANSING CIRCLE', 'Commerce City', 'CO', '80022', 'ervruiz@q.com', '(720) 217-7634', 'RV TYPE= KEYSTONE 2001', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUIZ' AND UPPER(first_name) = 'ERVIN') OR LOWER(email_primary) = 'ervruiz@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'DOYLE', '', '11771 CHAMBERS DR.', 'Commerce City', 'CO', '80022', 'mzdoyle@hotmail.com', '(720) 301-6955', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOYLE' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'mzdoyle@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Douglas', 'SAGER', '', '10266 OLATHE ST.', 'Commerce City', 'CO', '80022', 'sagerdw@gmail.com', '(303) 453-9718', 'RV TYPE= NORTH TRAIL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SAGER' AND UPPER(first_name) = 'DOUGLAS') OR LOWER(email_primary) = 'sagerdw@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joshua', 'LEE', '', '11388 NUCLA ST', 'Commerce City', 'CO', '80022', 'joshualee21@me.com', '(720) 698-5421', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEE' AND UPPER(first_name) = 'JOSHUA') OR LOWER(email_primary) = 'joshualee21@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Krista', 'SINGLETON', '', '10656 WHEELING ST.', 'Commerce City', 'CO', '80022', 'kristak9@verizon.net', '(303) 877-0387', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SINGLETON' AND UPPER(first_name) = 'KRISTA') OR LOWER(email_primary) = 'kristak9@verizon.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'RAVAN', '', '10430 QUINTERO ST.', 'Commerce City', 'CO', '80022', 'matthew.ravan@gmail.com', '(720) 840-9664', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAVAN' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'matthew.ravan@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kirby', 'PSC Q3 CONTRACTING', '', '5300 COLORADO BLVD SERVICE ROAD B', 'Commerce City', 'CO', '80022', 'kchapman@prim.com', '(303) 901-4611', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PSC Q3 CONTRACTING' AND UPPER(first_name) = 'KIRBY') OR LOWER(email_primary) = 'kchapman@prim.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'ZIMMERMAN', '', '10519 SEDALIA ST.', 'Commerce City', 'CO', '80022', 'stvzmnz@msn.com', '(303) 847-9566', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIMMERMAN' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'stvzmnz@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tyler', 'OSTROM', '', '6307 OLIVE ST.', 'Commerce City', 'CO', '80022', 'tycobeer@aol.com', '(303) 882-8660', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OSTROM' AND UPPER(first_name) = 'TYLER') OR LOWER(email_primary) = 'tycobeer@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lorin', 'STERN', '', '4960 LOCUST', 'Commerce City', 'CO', '80022', 'construcsys3@gmail.com', '(303) 910-9265', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STERN' AND UPPER(first_name) = 'LORIN') OR LOWER(email_primary) = 'construcsys3@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'MCMILLEN', '', '15876 E. 108TH AVE', 'Commerce City', 'CO', '80022', 'gmcmillen@mac.com', '(720) 347-9004', 'Alt email: gmcmillen@mac.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCMILLEN' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gmcmillen@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tristan', 'COLBORG', '', '10234 TELLURIDE WAY', 'Commerce City', 'CO', '80022', 'tcolborg@gmail.com', '(720) 435-9277', 'RV TYPE= FORD E450', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLBORG' AND UPPER(first_name) = 'TRISTAN') OR LOWER(email_primary) = 'tcolborg@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'LECARNER', '', '17310 E. 95TH AVE.', 'Commerce City', 'CO', '80022', 'thomas.lecarner@colorado.edu', '(303) 847-1551', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LECARNER' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'thomas.lecarner@colorado.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt & Rhonda', 'ABDULLA', '', '11940 JASPER ST. #166', 'Commerce City', 'CO', '80022', 'matthewabdulla@yahoo.com', '(720) 339-4010', 'RV TYPE= FR AVENGER 28''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ABDULLA' AND UPPER(first_name) = 'MATT & RHONDA') OR LOWER(email_primary) = 'matthewabdulla@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Debbie', 'MCCRORIE', '', '10430 VAUGHN WAY', 'Commerce City', 'CO', '80022', 'dam1061@gmail.com', '(303) 564-7545', 'RV TYPE= WINNEBAGO ACCESS CLASS C', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCRORIE' AND UPPER(first_name) = 'DEBBIE') OR LOWER(email_primary) = 'dam1061@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'AUSTIN', '', '6590 E. 49TH AVE', 'Commerce City', 'CO', '80022', 'allareagaragedoors60@gmail.com', '(303) 243-0598', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AUSTIN' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'allareagaragedoors60@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kari', 'GARCIA', '', '15643 E 96TH WAY', 'Commerce City', 'CO', '80022', 'hdkarik@yahoo.com', '(303) 807-4634', 'RV TYPE= OUTBACK 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARCIA' AND UPPER(first_name) = 'KARI') OR LOWER(email_primary) = 'hdkarik@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maxwell', 'DURON', '', '15573 E 109TH AVE.', 'Commerce City', 'CO', '80022', 'maxduron932@gmail.com', '(307) 212-2608', 'RV TYPE= JAYCO JAYFLIGHT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DURON' AND UPPER(first_name) = 'MAXWELL') OR LOWER(email_primary) = 'maxduron932@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anthony', 'MAKELA', '', '10604 OURAY COURT', 'Commerce City', 'CO', '80022', 'anthony.makela@yahoo.com', '(303) 653-2626', 'RV TYPE= FR FR3 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAKELA' AND UPPER(first_name) = 'ANTHONY') OR LOWER(email_primary) = 'anthony.makela@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerry', 'ZIMMERMAN', '', '9674 LANSING CIRCLE', 'Commerce City', 'CO', '80022', 'jplzman@yahoo.com', '(303) 287-0871', 'Alt phone: (720) 878-1800', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIMMERMAN' AND UPPER(first_name) = 'JERRY') OR LOWER(email_primary) = 'jplzman@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Repair', 'MTRV - POLYUREA ESTIMATE', '', '6590 E. 49TH AVE.', 'Commerce City', 'CO', '80022', 'service@mastertechrvrepair.com', '(303) 557-2214', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MTRV - POLYUREA ESTIMATE' AND UPPER(first_name) = 'REPAIR') OR LOWER(email_primary) = 'service@mastertechrvrepair.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joseph-Kristi', 'LUEVANO', '', '16495 E. 107TH PLACE', 'Commerce City', 'CO', '80022', 'luevanojose@aol.com', '(720) 468-1618', 'RV TYPE=  HEARTLAND 2750 BH 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUEVANO' AND UPPER(first_name) = 'JOSEPH-KRISTI') OR LOWER(email_primary) = 'luevanojose@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joshua', 'HOUDE', '', '10546 RACINE ST.', 'Commerce City', 'CO', '80022', 'joshua.m.houde@gmail.com', '(720) 224-1703', 'RV TYPE= FR EPRO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOUDE' AND UPPER(first_name) = 'JOSHUA') OR LOWER(email_primary) = 'joshua.m.houde@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thad', 'LAWLER', '', '16287 E. 105TH CIRCLE', 'Commerce City', 'CO', '80022', 'tclawler@msn.com', '(303) 288-4103', 'RV TYPE= FORD E450 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LAWLER' AND UPPER(first_name) = 'THAD') OR LOWER(email_primary) = 'tclawler@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trevor', 'HUGHES', '', '10267 WACO COURT', 'Commerce City', 'CO', '80022', 'trevorhughes@yahoo.com', '(303) 641-6643', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUGHES' AND UPPER(first_name) = 'TREVOR') OR LOWER(email_primary) = 'trevorhughes@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'KOGER', '', '10693 NUCLA ST.', 'Commerce City', 'CO', '80022', '', '(303) 919-5978', 'RV TYPE= SPORT TEK 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOGER' AND UPPER(first_name) = 'MIKE'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Livia', 'GOMES', '', '9758 LAREDO ST #408', 'Commerce City', 'CO', '80022', 'lrosegomes@gmail.com', '(720) 416-0901', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOMES' AND UPPER(first_name) = 'LIVIA') OR LOWER(email_primary) = 'lrosegomes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'KREHBIEL', '', '10463 OURAY ST.', 'Commerce City', 'CO', '80022', 'krehbiel999@gmail.com', '(970) 691-7803', 'RV TYPE= MINNIE WINNEBAGO 2005', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KREHBIEL' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'krehbiel999@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shon', 'SMITH', 'STAPLETON MOTORS', '4905 OLIVE ST', 'Commerce City', 'CO', '80022', 'shon00777@gmail.com', '(303) 261-9000', 'Alt email: shon@stapletonmotors.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'SHON') OR LOWER(email_primary) = 'shon00777@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'MONTOYA', '', '9831 JASPER DRIVE', 'Commerce City', 'CO', '80022', 'dmack4227@gmail.com', '(303) 519-7311', 'RV TYPE= KEYSTONE HIDEOUT 30'' 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTOYA' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'dmack4227@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Diego', 'LARA', '', '7110 IVY ST', 'Commerce City', 'CO', '80022', '', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LARA' AND UPPER(first_name) = 'DIEGO'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Leonard', 'DITTMAN', '', '10441 TRUCKEE ST UNIT A', 'Commerce City', 'CO', '80022', 'leonarddittman@gmail.com', '(303) 681-4097', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DITTMAN' AND UPPER(first_name) = 'LEONARD') OR LOWER(email_primary) = 'leonarddittman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Linda', 'PASSAMANECK', '', '15969 E. 115TH WAY', 'Commerce City', 'CO', '80022', 'ljpassaman@live.com', '(720) 579-8675', 'RV TYPE= FR GREY WOLF 29''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PASSAMANECK' AND UPPER(first_name) = 'LINDA') OR LOWER(email_primary) = 'ljpassaman@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marc', 'GUTTMAN', '', '10192 RICHFIELD WAY', 'Commerce City', 'CO', '80022', 'mguttman6634@gmail.com', '(303) 263-1424', 'RV TYPE= KEYSTONE BULLET 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GUTTMAN' AND UPPER(first_name) = 'MARC') OR LOWER(email_primary) = 'mguttman6634@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nick', 'GRAFF', '', '15629 E. 108TH AVE.', 'Commerce City', 'CO', '80022', 'ngraff@noodles.com', '(720) 480-2526', 'RV TYPE= ROCKWOOD ROO 24WS 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRAFF' AND UPPER(first_name) = 'NICK') OR LOWER(email_primary) = 'ngraff@noodles.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lynne', 'GRAY', '', '10086 PITKIN WAY', 'Commerce City', 'CO', '80022', 'lmgray1961@msn.com', '(303) 810-9141', 'RV TYPE= DUTCHMAN KODIAK 2012', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRAY' AND UPPER(first_name) = 'LYNNE') OR LOWER(email_primary) = 'lmgray1961@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bregan', 'MCGARY', '', '16476 E 117TH COURT', 'Commerce City', 'CO', '80022', 'breganjmcgary@hotmail.com', '(720) 218-0371', 'RV TYPE= CHEROKEE TT 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCGARY' AND UPPER(first_name) = 'BREGAN') OR LOWER(email_primary) = 'breganjmcgary@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'MCMILLEN', '', '15876 E. 105TH AVE.', 'Commerce City', 'CO', '80022', 'gmcmillen@mac.com', '(720) 347-9004', 'RV TYPE= RENEGADE CLASS B', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCMILLEN' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gmcmillen@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'BAIRD', '', '15664 DEER MOUNTAIN CIRCLE', 'Broomfield', 'CO', '80023', 'brianwbaird56@gmail.com', '(720) 238-2973', 'RV TYPE= KEYSTONE PASSPORT 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAIRD' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brianwbaird56@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Luke', 'ORANDER', '', '1485 W. 148TH AVE.', 'Westminster', 'CO', '80023', 'luke@goavens.com', '(720) 606-9141', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ORANDER' AND UPPER(first_name) = 'LUKE') OR LOWER(email_primary) = 'luke@goavens.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kristen', 'JENSEN', '', '4667 LONGST CT.', 'Broomfield', 'CO', '80023', 'kkjensen16@outlook.com', '(720) 745-0292', 'RV TYPE= JAYCO ENVOY', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JENSEN' AND UPPER(first_name) = 'KRISTEN') OR LOWER(email_primary) = 'kkjensen16@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'STAMBACK', '', '1275 EVERSOLE DR.', 'Broomfield', 'CO', '80023', 'mikestamback@yahoo.com', '(720) 289-0996', 'RV TYPE= TRITON TOY HAULER 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STAMBACK' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mikestamback@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'ROSITAS', '', '2351 W. 154TH', 'Broomfield', 'CO', '80023', 'chris@rositas.biz', '(303) 598-4884', 'RV TYPE= WINNEBAGO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROSITAS' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'chris@rositas.biz');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve/Deborah', 'YEAGER', '', '13721 PLASTER PT. #102', 'Broomfield', 'CO', '80023', 'steve_yeager@comcast.net', '(303) 241-2260', 'RV TYPE= JAYCO JAYFEATHER 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YEAGER' AND UPPER(first_name) = 'STEVE/DEBORAH') OR LOWER(email_primary) = 'steve_yeager@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mj', 'WYLIE', '', '14256 CORRINE CT.', 'Broomfield', 'CO', '80023', '', '(303) 961-7050', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WYLIE' AND UPPER(first_name) = 'MJ'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nancy', 'PORTHAN', '', '4120 BLAIR PEAK DR.', 'Broomfield', 'CO', '80023', 'nancy@nobletvl.com', '(307) 413-4156', 'RV TYPE= AS CARAVEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PORTHAN' AND UPPER(first_name) = 'NANCY') OR LOWER(email_primary) = 'nancy@nobletvl.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lish', 'EARLY', '', '2871 MADISON LANE', 'Broomfield', 'CO', '80023', 'lishster2002@gmail.com', '(720) 887-5975', 'RV TYPE= LANCE 2375 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EARLY' AND UPPER(first_name) = 'LISH') OR LOWER(email_primary) = 'lishster2002@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kendric & Nicole', 'HUBBARD', '', '2681 CREEKSIDE DRIVE', 'Broomfield', 'CO', '80023', 'kendrichubbard@gmail.com', '(303) 999-1479', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUBBARD' AND UPPER(first_name) = 'KENDRIC & NICOLE') OR LOWER(email_primary) = 'kendrichubbard@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'SILVERS', '', '4917 BUFFALO GRASS LOOP', 'Broomfield', 'CO', '80023', 'tomlsilvers@gmail.com', '(720) 273-1558', 'RV TYPE= AS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SILVERS' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'tomlsilvers@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pat', 'ENDERLE', '', '1164 W. 170TH PLACE', 'Broomfield', 'CO', '80023-6604', 'jaycoman@sbcglobal.net', '(815) 262-9852', 'RV TYPE= WINNEBAGO MINNIE 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ENDERLE' AND UPPER(first_name) = 'PAT') OR LOWER(email_primary) = 'jaycoman@sbcglobal.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pam', 'PAINTER', '', '1296 DORIC DR.', 'Lafayette', 'CO', '80026', 'rpzwpainter@gmail.com', '(513) 708-9807', 'RV TYPE= KEYSTONE KODIAK', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PAINTER' AND UPPER(first_name) = 'PAM') OR LOWER(email_primary) = 'rpzwpainter@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Liran', 'TZIPORY', '', '10443 SUNLIGHT DR.', 'Lafayette', 'CO', '80026', 'neurovetltz@gmail.com', '(970) 231-1312', 'RV TYPE= EMBER/191 MDB 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TZIPORY' AND UPPER(first_name) = 'LIRAN') OR LOWER(email_primary) = 'neurovetltz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Charles', 'REX', '', '1422 CYPRESS CIRCLE', 'Lafayette', 'CO', '80026', 'cmrexx@gmail.com', '(303) 725-8221', 'RV TYPE= LANCE 2185 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REX' AND UPPER(first_name) = 'CHARLES') OR LOWER(email_primary) = 'cmrexx@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rayna', 'POST', '', '2025 GYROS DR.', 'Lafayette', 'CO', '80026', 'raynapost@gmail.com', '(719) 963-9495', 'RV TYPE= TAB TRAILER 2005', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'POST' AND UPPER(first_name) = 'RAYNA') OR LOWER(email_primary) = 'raynapost@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'KOVALESKI', '', '705 W. LUCERNE DR.', 'Lafayette', 'CO', '80026', 'kovjus80@gmail.com', '(720) 630-3613', 'RV TYPE= FR PALOMINO 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOVALESKI' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'kovjus80@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike & Helen', 'MIRANDA', '', '713 PASCHAL DRIVE', 'Lafayette', 'CO', '80026', 'miranda-mike@msn.com', '(970) 302-6839', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MIRANDA' AND UPPER(first_name) = 'MIKE & HELEN') OR LOWER(email_primary) = 'miranda-mike@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'BEECHEN', '', '2673 TRAIL RIDGE DR W', 'Lafayette', 'CO', '80026', 'jbeechen@gmail.com', '(720) 421-6464', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BEECHEN' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'jbeechen@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'MONNETTE', '', '2839 SHADOW LAKE RD', 'Lafayette', 'CO', '80026', 'cmonnette@gmail.com', '(720) 838-1377', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONNETTE' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'cmonnette@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marilyn', 'MONNETTE', '', '2840 SHADOW LAKE RD', 'Lafayette', 'CO', '80026', 'marilynmonnette@gmail.com', '(303) 726-7889', 'RV TYPE= DODGE RAM 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONNETTE' AND UPPER(first_name) = 'MARILYN') OR LOWER(email_primary) = 'marilynmonnette@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Laura', 'STEBELTON', '', '612 HOMESTEAD ST', 'Lafayette', 'CO', '80026', 'yeti1@mac.com', '(303) 517-3676', 'RV TYPE= AS BAMBI 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEBELTON' AND UPPER(first_name) = 'LAURA') OR LOWER(email_primary) = 'yeti1@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brandon', 'HINER', '', '146 ZENITH AVE.', 'Lafayette', 'CO', '80026', '', '(720) 837-7019', 'RV TYPE= AS BAMBI 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HINER' AND UPPER(first_name) = 'BRANDON'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Peter', 'JOHANSON', '', '700 E BASELINE RD', 'Lafayette', 'CO', '80026', 'peter@peterjohanson.com', '(413) 535-9949', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHANSON' AND UPPER(first_name) = 'PETER') OR LOWER(email_primary) = 'peter@peterjohanson.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Veronica', 'HRUTKAY', '', '2246 EAGLES NEST DR.', 'Lafayette', 'CO', '80026', 'veronica.hrutkay@gmail.com', '(719) 231-3903', 'RV TYPE= SUNLINE 2004', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HRUTKAY' AND UPPER(first_name) = 'VERONICA') OR LOWER(email_primary) = 'veronica.hrutkay@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jay & Peg', 'MILLER', '', '750 VICTORIA CT.', 'Lafayette', 'CO', '80026', 'jaynpeg@msn.com', '(303) 661-0601', 'RV TYPE= GD 295RL 33'' 2018 | Alt phone: (303) 709-5124', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MILLER' AND UPPER(first_name) = 'JAY & PEG') OR LOWER(email_primary) = 'jaynpeg@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'DANIEL', '', '981 SIR GALAHAD DRIVE', 'Lafayette', 'CO', '80026', 'lisadaniel@live.com', '(917) 541-1395', 'RV TYPE= SCAMP TT 2002', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DANIEL' AND UPPER(first_name) = 'LISA') OR LOWER(email_primary) = 'lisadaniel@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'C Michael', 'REX', '', '1422 CYPRESS CIR', 'Lafayette', 'CO', '80026', 'cmrexx@gmail.com', '(303) 725-8221', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REX' AND UPPER(first_name) = 'C MICHAEL') OR LOWER(email_primary) = 'cmrexx@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cory', 'FILKENS', '', '11241 JASPER ROAD', 'Lafayette', 'CO', '80026', 'coryfilks@gmail.com', '(303) 945-6557', 'RV TYPE= ALLIANCE PARADIGM 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FILKENS' AND UPPER(first_name) = 'CORY') OR LOWER(email_primary) = 'coryfilks@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'SCOTT', '', '8934 ELGIN DRIVE', 'Lafayette', 'CO', '80026', 'rg3scott@gmail.com', '(720) 771-0148', 'RV TYPE= KEYSTONE SPRINGDALE 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCOTT' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'rg3scott@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'LINK', '', '361 TYLER AVE.', 'Louisville', 'CO', '80027', 'plink50@comcast.net', '(303) 359-5839', 'RV TYPE= 2021 NUCAMP', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINK' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'plink50@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'LYON', '', 'PO BOX 270595', 'Louisville', 'CO', '80027', 'xlyon@mac.com', '(505) 603-5405', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LYON' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'xlyon@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'LEONESIO', '', '2320 WYNONNA CT.', 'Louisville', 'CO', '80027', 'ron.leonesio@gmail.com', '(303) 725-8854', 'RV TYPE= TAB/NUCAMP', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEONESIO' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'ron.leonesio@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jay', 'MCMAHON', '', '783 MAROON PEAK CIRCLE', 'Superior', 'CO', '80027', 'jay.mcmahon@gmail.com', '(605) 366-3210', 'RV TYPE= AS SAFARI 2004', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCMAHON' AND UPPER(first_name) = 'JAY') OR LOWER(email_primary) = 'jay.mcmahon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jimmy', 'STEIN', '', '1104 GARFIELD AVE.', 'Louisville', 'CO', '80027', 'jimmydonal@gmail.com', '(202) 507-9145', 'RV TYPE= TAXA/MANTIS 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEIN' AND UPPER(first_name) = 'JIMMY') OR LOWER(email_primary) = 'jimmydonal@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joan', 'HOOVER', '', '301 GROUSE COURT', 'Louisville', 'CO', '80027', 'blklabs4@centurylink.net', '(303) 587-3179', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOOVER' AND UPPER(first_name) = 'JOAN') OR LOWER(email_primary) = 'blklabs4@centurylink.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Corin', 'O''CONNELL', '', '1059 W. WILLOW ST.', 'Louisville', 'CO', '80027', 'corin.oconnell@gmail.com', '(720) 530-0700', 'RV TYPE= AS FLYING CLOUD 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'O''CONNELL' AND UPPER(first_name) = 'CORIN') OR LOWER(email_primary) = 'corin.oconnell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sherry', 'MACK', '', '270 PROMENADE DR #305', 'Superior', 'CO', '80027', 'sherry.mack@me.com', '(916) 502-7805', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MACK' AND UPPER(first_name) = 'SHERRY') OR LOWER(email_primary) = 'sherry.mack@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'GILROY', '', '317 MONARCH ST.', 'Louisville', 'CO', '80027', 'gilroyjamie@yahoo.com', '(303) 709-3909', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GILROY' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'gilroyjamie@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allyson', 'DAUGHERTY', '', '651 FAIRFIELD LANE', 'Louisville', 'CO', '80027', 'allyson.daugherty14@gmail.com', '(760) 484-0222', 'RV TYPE= AS BAMBI SPORT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAUGHERTY' AND UPPER(first_name) = 'ALLYSON') OR LOWER(email_primary) = 'allyson.daugherty14@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'FANGER', '', '2323 SUNLAND ST.', 'Louisville', 'CO', '80027', 'gregfanger@gmail.com', '', 'RV TYPE= VIKING 17FQ', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FANGER' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gregfanger@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aaron', 'WANG', '', '1995 E COALTON ROAD', 'Superior', 'CO', '80027', 'aaronccwang@gmail.com', '(848) 365-7336', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WANG' AND UPPER(first_name) = 'AARON') OR LOWER(email_primary) = 'aaronccwang@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'EVANS', '', '651 FAIRLFIELD LANE', 'Louisville', 'CO', '80027', 'ryanevane5323@gmail.com', '(760) 522-5420', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EVANS' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'ryanevane5323@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Drew', 'EWING', '', '1115 W HECLA DRIVE  #204', 'Louisville', 'CO', '80027', 'brecklodging@gmail.com', '(970) 409-0227', 'RV TYPE= LEXINGTON/PALAMINO 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EWING' AND UPPER(first_name) = 'DREW') OR LOWER(email_primary) = 'brecklodging@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'STEWARD', '', '7574 W. COAL CREEK DR.', 'Louisville', 'CO', '80027', 'stevestewardco@gmail.com', '(303) 888-7004', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEWARD' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'stevestewardco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tasha', 'LOR', '', '7371 VRAIN ST', 'Westminster', 'CO', '80030', 'lanuanalor2007@yahoo.com', '(720) 933-1553', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LOR' AND UPPER(first_name) = 'TASHA') OR LOWER(email_primary) = 'lanuanalor2007@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'LAWLOR', '', '9425 LAMAR ST', 'Westminster', 'CO', '80031', 'matt.lawlor@yahoo.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LAWLOR' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'matt.lawlor@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jay', 'MILLAR', '', '10597 LOWELL DR', 'Westminster', 'CO', '80031', 'jmillar007@msn.com', '(303) 475-8778', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MILLAR' AND UPPER(first_name) = 'JAY') OR LOWER(email_primary) = 'jmillar007@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'FORTUNE', '', '4148 W 118TH PLACE', 'Westminster', 'CO', '80031', 'danieljfortune@gmail.com', '(303) 378-0050', 'RV TYPE= AS CARAVEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FORTUNE' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'danieljfortune@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'FOX', '', '3517 W. 101ST STREET', 'Westminster', 'CO', '80031', 'foxdoc@earthlink.net', '(720) 212-6762', 'RV TYPE= FR E-PRO 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOX' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'foxdoc@earthlink.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'HAYNES', '', '10354 JULIAN COURT', 'Westminster', 'CO', '80031', 'dhaynes1883@msn.com', '(303) 507-1883', 'RV TYPE= GD REFLECTION 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAYNES' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'dhaynes1883@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'RADY', '', '4150 W. 116TH WAY', 'Thornton', 'CO', '80031', 'jeffrey.rady@gmail.com', '', 'RV TYPE= WINNIE MICRO BHS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RADY' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeffrey.rady@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'RADY', '', '11800 QUITMAN PLACE', 'Thornton', 'CO', '80031', 'onedoubles@gmail.com', '(303) 217-6859', 'RV TYPE= TRAILS WEST TRAILER 28''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RADY' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'onedoubles@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Harley', 'COURT', '', '9938 WOLFF ST.', 'Westminster', 'CO', '80031', 'gharley74@gmail.com', '(720) 352-3855', 'RV TYPE= PREMIER TT 30''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COURT' AND UPPER(first_name) = 'HARLEY') OR LOWER(email_primary) = 'gharley74@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pam & Beth', 'DECKER & SAPERSTEIN', '', '4525 W. 10TH CIRCLE', 'Westminster', 'CO', '80031', 'pj88notes@comcast.net', '(303) 941-9637', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DECKER & SAPERSTEIN' AND UPPER(first_name) = 'PAM & BETH') OR LOWER(email_primary) = 'pj88notes@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Emily', 'BISCHOFF', '', '11633 NEWTON ST.', 'Westminster', 'CO', '80031', 'emilysteadman@yahoo.com', '(720) 626-8761', 'RV TYPE= JAYCO HUMMINGBIRD 17''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BISCHOFF' AND UPPER(first_name) = 'EMILY') OR LOWER(email_primary) = 'emilysteadman@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'CHANNIN', '', '4868 W. 99TH AVE.', 'Westminster', 'CO', '80031', 'jchannin@gmail.com', '(303) 704-6711', 'RV TYPE= HEARTLAND MALLARD 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHANNIN' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jchannin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelli', 'TORRES', '', '', 'Westminster', 'CO', '80031', 'kellitorres09@gmail.com', '(303) 350-7079', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TORRES' AND UPPER(first_name) = 'KELLI') OR LOWER(email_primary) = 'kellitorres09@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eli', 'SIMPSON', '', '4595 SAULSBURY ST', 'Wheat Ridge', 'CO', '80031', 'simpsoneli85@gmail.com', '(970) 629-5220', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SIMPSON' AND UPPER(first_name) = 'ELI') OR LOWER(email_primary) = 'simpsoneli85@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kathrin/ Brian', 'TROXLER/ERBNER', '', '3905 BALSALM ST.', 'Wheat Ridge', 'CO', '80033', 'ktroxler@aspire-tours.com', '(720) 323-5656', 'Alt phone: (720) 245-7760', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TROXLER/ERBNER' AND UPPER(first_name) = 'KATHRIN/ BRIAN') OR LOWER(email_primary) = 'ktroxler@aspire-tours.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Martie', 'MCDOUGALL', '', '9815 W. 37TH AVE.', 'Wheat Ridge', 'CO', '80033', 'martiemac@gmail.com', '(720) 879-7249', 'RV TYPE= SPRINTER KEYSTONE 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCDOUGALL' AND UPPER(first_name) = 'MARTIE') OR LOWER(email_primary) = 'martiemac@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Vicki', 'OTTOSON', '', '4210 BRENTWOOD ST.', 'Wheat Ridge', 'CO', '80033', 'personal@comcast.net', '(303) 777-6144', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OTTOSON' AND UPPER(first_name) = 'VICKI') OR LOWER(email_primary) = 'personal@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jared And Ondine', 'PETERSON', '', '7237 W 26TH AVE.', 'Wheat Ridge', 'CO', '80033', 'jaredpeterson70@gmail.com', '(303) 241-6253', 'Alt phone: (303) 548-8514', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PETERSON' AND UPPER(first_name) = 'JARED AND ONDINE') OR LOWER(email_primary) = 'jaredpeterson70@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Martie', 'MACDOUGALL', '', '9815 W 37TH AVE.', 'Wheat Ridge', 'CO', '80033', 'martiemac@gmail.com', '(720) 879-7249', 'RV TYPE= SPRINTER KEYSTONE 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MACDOUGALL' AND UPPER(first_name) = 'MARTIE') OR LOWER(email_primary) = 'martiemac@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ernie/Vicki', 'NITKA -OTTOSON', '', '4210 BRENTWOOD ST.', 'Wheatridge', 'CO', '80033', 'personal@comcast.net', '(303) 777-6144', 'RV TYPE= AS FLYING CLOUD 2011 | Alt email: enitka1@comcast.net | Alt phone: (303) 478-2026', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NITKA -OTTOSON' AND UPPER(first_name) = 'ERNIE/VICKI') OR LOWER(email_primary) = 'personal@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'PHALEN', '', '4205 DOVER ST', 'Wheatridge', 'CO', '80033', 'pat.phalen@gmail.com', '(303) 941-8477', 'RV TYPE= AS SAFARI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PHALEN' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'pat.phalen@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mason', 'HAYCOCK', '', '3470 SAULSBURY CT', 'Wheat Ridge', 'CO', '80033', 'mason.haycock@gmail.com', '(719) 238-0072', 'Alt phone: (316) 393-1503', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAYCOCK' AND UPPER(first_name) = 'MASON') OR LOWER(email_primary) = 'mason.haycock@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Donovan', 'BUSNARDO', '', '10861 UTICA ST', 'Westminster', 'CO', '80081', 'donovanbusnardo@yahoo.com', '(303) 579-7774', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUSNARDO' AND UPPER(first_name) = 'DONOVAN') OR LOWER(email_primary) = 'donovanbusnardo@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tyler', 'HALL', '', '3105 KEEPSAKE WAY', 'Castle Rock', 'CO', '80101', 'tyler@hall-contracting.com', '(303) 489-8036', 'RV TYPE= GD REFLECTION', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HALL' AND UPPER(first_name) = 'TYLER') OR LOWER(email_primary) = 'tyler@hall-contracting.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'HOOD', '', '35595 COUNTY ROAD 116', 'Agate', 'CO', '80101', 'batmanbeond@gmail.com', '(928) 207-0285', 'RV TYPE= ITASCA 2000', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOOD' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'batmanbeond@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zachary', 'JORDAN', '', '379 WALNUT ST.', 'Bennett', 'CO', '80102', 'zacharyguyjordan@hotmail.com', '(760) 382-8658', 'INSURANCE ADJUSTER IS DOING AN ESTIMATE - PROGRESSIVE Adjuster - daniel cybowicz - 440-910-6249  a108454@progressive.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JORDAN' AND UPPER(first_name) = 'ZACHARY') OR LOWER(email_primary) = 'zacharyguyjordan@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'ALEXANDER', '', '45806 SILVER DROP AVE', 'Bennett', 'CO', '80102', 'bencalexander@aol.com', '(303) 909-4399', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ALEXANDER' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'bencalexander@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Melissa', 'LONG', '', '52245 E. 144TH AVE.', 'Bennett', 'CO', '80102', 'melissatylong2017@gmail.com', '(720) 526-4451', 'RV TYPE= RAPTOR 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LONG' AND UPPER(first_name) = 'MELISSA') OR LOWER(email_primary) = 'melissatylong2017@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Garrett', 'MARTIN', '', '137 MONARCH ST.', 'Bennett', 'CO', '80102', 'garrettm26@gmail.com', '(573) 465-4532', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTIN' AND UPPER(first_name) = 'GARRETT') OR LOWER(email_primary) = 'garrettm26@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jb', 'JAMES', '', '1050 MANILARD', 'Bennett', 'CO', '80102', 'jjames@ccpipeline.com', '(303) 819-0122', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JAMES' AND UPPER(first_name) = 'JB') OR LOWER(email_primary) = 'jjames@ccpipeline.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Travis', 'CALHOUN', '', '50100 E 48TH AVE', 'Bennett', 'CO', '80102', 'tacalhoun78@gmail.com', '(541) 905-5897', 'SERVICE CALL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CALHOUN' AND UPPER(first_name) = 'TRAVIS') OR LOWER(email_primary) = 'tacalhoun78@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jennifer', 'ROGERS', '', '1020 GREEN GABLES CIRCLE', 'Bennett', 'CO', '80102', 'jrogers@idealawgroupllc.com', '(720) 625-0688', 'RV TYPE= AS SERENITY 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROGERS' AND UPPER(first_name) = 'JENNIFER') OR LOWER(email_primary) = 'jrogers@idealawgroupllc.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jay', 'BAUER', '', '4790 VINDALE LANE', 'Byers', 'CO', '80103', 'jaybauer14@gmail.com', '(303) 638-9558', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAUER' AND UPPER(first_name) = 'JAY') OR LOWER(email_primary) = 'jaybauer14@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dennis', 'TONNESLAN', '', '71797 E COUNTY RD 10', 'Byers', 'CO', '80103', 'dennis@tonneslan.com', '(360) 710-1239', 'RV TYPE= GD 397 TH 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TONNESLAN' AND UPPER(first_name) = 'DENNIS') OR LOWER(email_primary) = 'dennis@tonneslan.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'BOMAN', '', '2638 CASTLE CREST DRIVE', 'Castle Rock', 'CO', '80104', 'winnebago70@gmail.com', '(303) 916-7110', 'RV TYPE= WINNEBAGO VIA 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOMAN' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'winnebago70@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'MORRISSEY', '', '1120 WHISPERING OAK DR.', 'Castle Rock', 'CO', '80104', 'mmorrissey8281@gmail.com', '(720) 877-8353', 'RV TYPE= E550 4WINDS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORRISSEY' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mmorrissey8281@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'SIBERT', '', '1296 ASH HOLLOW PLACE', 'Castle Rock', 'CO', '80104', 'steve.sibert@charter.com', '(303) 507-1682', 'Alt email: stevesibert55@msn.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SIBERT' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'steve.sibert@charter.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'CADICE', '', '2016 SADDLEBACK DRIVE', 'Castle Rock', 'CO', '80104', 'traveller029@gmail.com', '(303) 588-5522', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CADICE' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'traveller029@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelsey', 'WILLIAMS', '', '3490 ANTELOPE CIRCLE', 'Elizabeth', 'CO', '80107', '', '(209) 324-0075', 'RV TYPE= SPRINTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'KELSEY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chase', 'PIKER', '', '42767 IVYDEL ST.', 'Elizabeth', 'CO', '80107', 'cpiker1990@gmail.com', '(720) 280-5851', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PIKER' AND UPPER(first_name) = 'CHASE') OR LOWER(email_primary) = 'cpiker1990@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David-Jeanne', 'TYNG', '', '1398 CONIFER TRAIL', 'Elizabeth', 'CO', '80107', 'jetyng@gmail.com', '(303) 646-3876', 'RV TYPE= CUSTOMER IS STORING AND CONSIGNING WITH US TO SELL THE RV. | Alt email: tyng@cthcpa.com | Alt phone: (303) 941-0993', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TYNG' AND UPPER(first_name) = 'DAVID-JEANNE') OR LOWER(email_primary) = 'jetyng@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'BUTTERFIELD', '', '5005 RICHARDS CT', 'Elizabeth', 'CO', '80107', 'bradb8422@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUTTERFIELD' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'bradb8422@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Therese', 'DAVIS', '', '1660 SAGE RD.', 'Elizabeth', 'CO', '80107', 'theresedavis55@gmail.com', '(303) 396-9052', 'RV TYPE= GD MOMENTUM 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'THERESE') OR LOWER(email_primary) = 'theresedavis55@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'BRUBAKER', '', '6054 BLUE TERRACE CIRCLE', 'Castle Pines', 'CO', '80108', 'bbruhaa2000@yahoo.com', '(480) 206-5769', 'RV TYPE= HEARTLAND SUNDANCE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRUBAKER' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'bbruhaa2000@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul And Taryn', 'LINDFORS', '', '244 BACK NINE DR', 'Castle Rock', 'CO', '80108', 'paul.lindfors@me.com', '(720) 237-0821', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINDFORS' AND UPPER(first_name) = 'PAUL AND TARYN') OR LOWER(email_primary) = 'paul.lindfors@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andy', 'MARINKOVICH', '', '12605 DANIELS GATE DR.', 'Castle Pines', 'CO', '80108', 'andymarinkovich@icloud.com', '(805) 415-1919', 'RV TYPE= AS INTERSTATE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARINKOVICH' AND UPPER(first_name) = 'ANDY') OR LOWER(email_primary) = 'andymarinkovich@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven', 'FLING', '', '310 SUMMERWOOD LANE', 'Castle Rock', 'CO', '80108', 'stevefling@gmail.com', '(720) 971-9747', 'RV TYPE= AS CLASSIC 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FLING' AND UPPER(first_name) = 'STEVEN') OR LOWER(email_primary) = 'stevefling@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'SLOAN', '', '1417 LANTERN WAY', 'Castle Rock', 'CO', '80109', 'mosloan9957@gmail.com', '(303) 906-2321', 'RV TYPE= AS FLYING CLOUD 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SLOAN' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mosloan9957@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Annette & Mark', 'TEDESCO', '', '5088 ROCKY MOUNTAIN DR.', 'Castle Rock', 'CO', '80109', 'treatpeoplerightalways@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TEDESCO' AND UPPER(first_name) = 'ANNETTE & MARK') OR LOWER(email_primary) = 'treatpeoplerightalways@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nancy & Jim', 'DUKE', '', '', 'Castle Rock', 'CO', '80109', 'jdbobble60@gmail.com', '(858) 736-4743', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUKE' AND UPPER(first_name) = 'NANCY & JIM') OR LOWER(email_primary) = 'jdbobble60@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven & Diane', 'MANNING', '', '4996 PERSIMMON LANE', 'Castle Rock', 'CO', '80109', 'sd611c@outlook.com', '(937) 902-2084', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MANNING' AND UPPER(first_name) = 'STEVEN & DIANE') OR LOWER(email_primary) = 'sd611c@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dillon', 'HUG', '', '3030 S.ELABI ST', 'Englewood', 'CO', '80110', 'hug.dillon@gmail.com', '(303) 720-5147', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUG' AND UPPER(first_name) = 'DILLON') OR LOWER(email_primary) = 'hug.dillon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Caitlin', 'ZARRELLA', '', '2949 S. ELATI ST', 'Englewood', 'CO', '80110', 'cnzarrella@gmail.com', '(603) 320-0458', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZARRELLA' AND UPPER(first_name) = 'CAITLIN') OR LOWER(email_primary) = 'cnzarrella@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'STAHL', '', '4990 S fulton St.', 'Englewood', 'CO', '80111', 'tom.stahl@colliers.com', '(303) 898-5800', 'Alt phone: (303) 745-5800', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STAHL' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'tom.stahl@colliers.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ted', 'ROLAND', '', '10858 E. MAPLEWOOD DR.', 'Englewood', 'CO', '80111', 'tedroland@gmail.com', '(303) 887-9950', 'RV TYPE= AS SPRINTER 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROLAND' AND UPPER(first_name) = 'TED') OR LOWER(email_primary) = 'tedroland@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Grant', 'PRICE', '', '6067 S IOLA CT', 'Englewood', 'CO', '80111', 'grantdprice@gmail.com', '(720) 298-7690', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRICE' AND UPPER(first_name) = 'GRANT') OR LOWER(email_primary) = 'grantdprice@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'CALVERT', '', '5724 S FLORENCE ST', 'Greenwood Village', 'CO', '80111', 'comtbkr@gmail.com', '(303) 489-8789', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CALVERT' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'comtbkr@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'CLARK', '', '1535 SPRING WATER WAY', 'Highlands Ranch', 'CO', '80112', 'fins32@rocketmail.com', '(720) 313-9287', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLARK' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'fins32@rocketmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Katherine', 'JOHNSON', '', '8694 E. DAVIES AVE.', 'Centennial', 'CO', '80112', 'katherineandmerrit@gmail.com', '(918) 804-3800', 'RV TYPE= FR SALEM 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON' AND UPPER(first_name) = 'KATHERINE') OR LOWER(email_primary) = 'katherineandmerrit@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'JONES', '', '7456 E LONG CR', 'Centennial', 'CO', '80112', 'davidm6jones@gmail.com', '(719) 213-7213', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JONES' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'davidm6jones@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'GOEGLEIN', '', '6943 S OLIVE WAY', 'Englewood', 'CO', '80112', 'mgoeglein3@gmail.com', '(303) 748-0492', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOEGLEIN' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mgoeglein3@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeffrey', 'SAUTEL', '', '6928 S. VALENTIA ST.', 'Centennial', 'CO', '80112', 'jsautel@gmail.com', '(303) 720-2950', 'RV TYPE= KEYSTONE COUGAR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SAUTEL' AND UPPER(first_name) = 'JEFFREY') OR LOWER(email_primary) = 'jsautel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven-Laura', 'ZIEMKE', '', '8547 E. ARAPAHOE ROAD UNIT J298', 'Greenwood Village', 'CO', '80112', 'theziemkes@msn.com', '(719) 339-8361', 'RV TYPE= FR ROCKWOOD 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIEMKE' AND UPPER(first_name) = 'STEVEN-LAURA') OR LOWER(email_primary) = 'theziemkes@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'ERICSON', '', '8091 S. NIAGARA WAY', 'Centennial', 'CO', '80112', 'ecericson@comcast.net', '(303) 908-2201', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ERICSON' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'ecericson@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'PARSONS', '', '4501 S. MONROE LANE', 'Englewood', 'CO', '80113', 'mparsons@atoja.com', '(970) 218-9912', 'RV TYPE= SPRINTER PASSAGE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PARSONS' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'mparsons@atoja.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ronald', 'FISH', '', '3210 S. FRANKLIN ST.', 'Englewood', 'CO', '80113', 'ronbevfish@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FISH' AND UPPER(first_name) = 'RONALD') OR LOWER(email_primary) = 'ronbevfish@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry', 'MODESITT', '', '11515 W. 84TH PLACE', 'Arvada', 'CO', '80115', 'modesittco@aol.con', '(720) 635-6030', 'RV TYPE= AS BAMBI 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MODESITT' AND UPPER(first_name) = 'LARRY') OR LOWER(email_primary) = 'modesittco@aol.con');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Glen', 'ROAT', '', '135 STAGHORN WAY', 'Franktown', 'CO', '80116', 'coroats@msn.com', '(307) 742-7512', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROAT' AND UPPER(first_name) = 'GLEN') OR LOWER(email_primary) = 'coroats@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'SCHOOLS', '', '30546 WHISPERING PINES PLACE', 'Kiowa', 'CO', '80117', 'rdschools38@gmail.com', '(317) 450-5269', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHOOLS' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'rdschools38@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bev', 'O''DONNELL', '', '6360 APACHE DRIVE', 'Larkspur', 'CO', '80118', 'obevy@aol.com', '(954) 444-6892', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'O''DONNELL' AND UPPER(first_name) = 'BEV') OR LOWER(email_primary) = 'obevy@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allan', 'MACKINNON', '', '7777 TAYLOR CIRCLE', 'Larkspur', 'CO', '80118', 'bigcgar@aol.com', '(303) 324-9555', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MACKINNON' AND UPPER(first_name) = 'ALLAN') OR LOWER(email_primary) = 'bigcgar@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'LEVENE', '', '12 LINDENWOOD DRIVE', 'Littleton', 'CO', '80120', 'copapajohn@gmail.com', '(303) 589-3875', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEVENE' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'copapajohn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert & April', 'SCHMIDT', '', '5890 S. FOX ST.', 'Littleton', 'CO', '80120', 'robschmidtre@gmail.com', '(303) 257-7220', 'DID NOT COLLECT FOR THIS WORK DUE TO SCRATCH MADE ON NEW ALUMINUM SHEET | Alt phone: (303) 519-4326', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHMIDT' AND UPPER(first_name) = 'ROBERT & APRIL') OR LOWER(email_primary) = 'robschmidtre@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'KOSSOFF STEPHENS', '', '3021 W. LONG COURT', 'Littleton', 'CO', '80120', 'zekeandjarodsmom@gmail.com', '(720) 291-7283', 'RV TYPE= JAYCO JAYFEATHER 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOSSOFF STEPHENS' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'zekeandjarodsmom@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tony', 'LALEH', '', '5200 S.UNIVERSITY BLVD.', 'Greenwood Village', 'CO', '80121', '21broker@gmail.com', '(720) 220-2113', 'RV TYPE= SPRINTER 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LALEH' AND UPPER(first_name) = 'TONY') OR LOWER(email_primary) = '21broker@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Simone', 'MANCUSO', '', '6123 S. MADISON DR.', 'Littleton', 'CO', '80121', 'simone@webuyhouseslouky.com', '(502) 689-2449', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MANCUSO' AND UPPER(first_name) = 'SIMONE') OR LOWER(email_primary) = 'simone@webuyhouseslouky.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'LIBHART', '', '2558 E. CRESTHILL AVE.', 'Centennial', 'CO', '80121', 'slibhart55@gmail.com', '(303) 946-9344', 'RV TYPE= AS BAMBI 2016 | Alt email: everythingbutcars@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LIBHART' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'slibhart55@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carlos', 'ZAMBRANO', '', '5036 E. WEAVER AVE.', 'Centennial', 'CO', '80121', 'cfz0159@gmail.com', '(720) 402-6231', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZAMBRANO' AND UPPER(first_name) = 'CARLOS') OR LOWER(email_primary) = 'cfz0159@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'HRADECKY', '', '5925 S. MILWAUKEE WAY', 'Centennial', 'CO', '80121', 'ehrad7656@gmail.com', '(720) 390-1768', 'RV TYPE= GD MOMENTUM 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HRADECKY' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'ehrad7656@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'DELL', '', '6848 S. ELIZABETH ST.', 'Centennial', 'CO', '80122', 'ezracer508@yahoo.com', '', 'RV TYPE= GD SOLITUDE 42''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DELL' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'ezracer508@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amy', 'WEEKS', '', '1816 E. MINERAL  AVE', 'Centennial', 'CO', '80122', 'delphinae74@gmail.com', '(303) 748-4168', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEEKS' AND UPPER(first_name) = 'AMY') OR LOWER(email_primary) = 'delphinae74@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'BOBZIEN', '', '7603 S. HARRISON WAY', 'Centennial', 'CO', '80122', 'john.e.bobzien@gmail.com', '(303) 324-4072', 'RV TYPE= AS CLASSIC 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOBZIEN' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'john.e.bobzien@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom & Sue', 'PALMER', '', '3820 E EASTER PLACE', 'Centennial', 'CO', '80122', 'thomasb.palmer@comcast.net', '(720) 394-5354', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PALMER' AND UPPER(first_name) = 'TOM & SUE') OR LOWER(email_primary) = 'thomasb.palmer@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'BUDDY', '', '5985 W. LEAWOOD DR.', 'Littleton', 'CO', '80123', 'rlkkb@q.com', '(303) 549-0991', 'RV TYPE= HEARTLAND NORTHTRAIL 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUDDY' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'rlkkb@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Darrell', 'ROOT', '', '6648 S. WEBSTER', 'Littleton', 'CO', '80123', 'dnrroot@msn.com', '(805) 832-0224', 'RV TYPE= ROAD TREK 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROOT' AND UPPER(first_name) = 'DARRELL') OR LOWER(email_primary) = 'dnrroot@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alex', 'GARCIA', '', '9415 W. WAGON TRAIL DR', 'Littleton', 'CO', '80123', 'alex0506@comcast.net', '(720) 380-4874', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARCIA' AND UPPER(first_name) = 'ALEX') OR LOWER(email_primary) = 'alex0506@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'NIXON', '', '6848 S. ELIZABETH ST.', 'Centennial', 'CO', '80123', 'stnixon5155@gmail.com', '(303) 868-5587', 'RV TYPE= GD SOLITUDE 42''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NIXON' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'stnixon5155@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'BUXTON', '', '9343 WINTER SKY CT.', 'Lone Tree', 'CO', '80124', 'jgbuxton@icloud.com', '(303) 888-9495', 'RV TYPE= AS CARAVEL | Alt email: kimberlybuxton@me.com | Alt phone: (303) 638-3939', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BUXTON' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'jgbuxton@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Don-Jennifer Conley', 'KING', '', '10504 NORTH SKY DRIVE', 'Lone Tree', 'CO', '80124', 'jcconley@hotmail.com', '(612) 384-1834', 'Alt phone: (214) 208-5325', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KING' AND UPPER(first_name) = 'DON-JENNIFER CONLEY') OR LOWER(email_primary) = 'jcconley@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jon', 'ROBBINS', '', '7529 INDIAN WELLS PLACE', 'Lone Tree', 'CO', '80124', 'neomanjonlaw@gmail.com', '(303) 907-2581', 'CUSTOMER PAID FOR THE AWNING ARM ASSEMBLY AWHILE AGO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROBBINS' AND UPPER(first_name) = 'JON') OR LOWER(email_primary) = 'neomanjonlaw@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Erik & Missy', 'PHILLIPS', '', '4875 ROXBOROUGH DR.', 'Littleton', 'CO', '80125', 'busav8r@gmail.com', '(303) 956-4811', 'Alt email: guppyflyer@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PHILLIPS' AND UPPER(first_name) = 'ERIK & MISSY') OR LOWER(email_primary) = 'busav8r@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'LYNCH', '', '6604 WILLOW BROOM TRAIL', 'Littleton', 'CO', '80125', 'wmmlynch@mac.com', '(303) 720-8315', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LYNCH' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'wmmlynch@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sue', 'BEELER', '', '9752 HUMMINGBIRD PLACE', 'Littleton', 'CO', '80125', 'suevestabeeler@gmail.com', '(720) 308-9951', 'RV TYPE= KEYSTONE MONTANA', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BEELER' AND UPPER(first_name) = 'SUE') OR LOWER(email_primary) = 'suevestabeeler@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Krystal', 'ARNEY', '', '7217 RED MESA CT.', 'Littleton', 'CO', '80125', 'krystalarney85@gmail.com', '(619) 792-9253', 'RV TYPE= JAYCO JAYFLIGHT 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARNEY' AND UPPER(first_name) = 'KRYSTAL') OR LOWER(email_primary) = 'krystalarney85@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'WHITE', '', '9673 MARMOT RIDGE CIRCLE', 'Littleton', 'CO', '80125', 'pwhite92@hotmail.com', '(720) 273-4722', 'RV TYPE= CONNECT SPREE 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITE' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'pwhite92@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chuck', 'BOSICK', '', '2991 CLAIRTON DR.', 'Highlands Ranch', 'CO', '80126', 'cbosick@gmail.com', '(303) 475-3188', 'RV TYPE= FR WILDCAT 5TH WHEEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOSICK' AND UPPER(first_name) = 'CHUCK') OR LOWER(email_primary) = 'cbosick@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'CAGIE', '', '10720 EVONDALE ST.', 'Highlands Ranch', 'CO', '80126', 'hometech.co@comcast.net', '(303) 994-8266', 'RV TYPE= HYPERLITE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAGIE' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'hometech.co@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob & Janet', 'DAVIS', '', '10726 FEATHERWALK WAY', 'Littleton', 'CO', '80126', 'bobdavispe@comcast.net', '(303) 241-9311', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'BOB & JANET') OR LOWER(email_primary) = 'bobdavispe@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'DIMATTEO', '', '80 FALCON HILLS DRIVE', 'Highlands Ranch', 'CO', '80126', 'totaldimatteo@gmail.com', '(303) 944-6839', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DIMATTEO' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'totaldimatteo@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'WOLACH', '', '9827 CLAIRTON LANE', 'Littleton', 'CO', '80126', 'pwolach@douglasscolony.com', '(303) 901-1462', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOLACH' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'pwolach@douglasscolony.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'SANDERS', '', '3851 MALLARD DR', 'Highlands Ranch', 'CO', '80126', 'msand7443@aol.com', '(303) 918-1605', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDERS' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'msand7443@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'DUPONT', '', '9926 CLAIRTON WAY', 'Littleton', 'CO', '80126', 'jdupont@nexgrp.com', '(303) 596-7618', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUPONT' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'jdupont@nexgrp.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brendon', 'CODY', '', '10080 WEST FAIR AVE', 'Littleton', 'CO', '80127', 'cody.brendon@gmail.com', '(720) 296-9684', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CODY' AND UPPER(first_name) = 'BRENDON') OR LOWER(email_primary) = 'cody.brendon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'GILMORE', '', '11416 W. COAL MINE DR.', 'Littleton', 'CO', '80127', 'johngilmore1010@hotmail.com', '(720) 255-8923', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GILMORE' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'johngilmore1010@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Craig', 'HAMILTON', '', '6140 W FAIRVIEW AVE.', 'Littleton', 'CO', '80128', 'cdhpharmd@gmail.com', '(719) 332-6566', 'Alt email: 6140w.fairview ave', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAMILTON' AND UPPER(first_name) = 'CRAIG') OR LOWER(email_primary) = 'cdhpharmd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'HATTAWAY', '', '8633 W. INDORE PLACE', 'Littleton', 'CO', '80128', 'justin@gekco.org', '(801) 510-1392', 'RV TYPE= GD IMAGINE 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HATTAWAY' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'justin@gekco.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chuck', 'FISHER', '', '8506 S. UPHAM WAY', 'Littleton', 'CO', '80128', 'chuck.fisher2@yahoo.com', '(303) 946-6983', 'RV TYPE= GULFSTREAM AMERILITE TT 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FISHER' AND UPPER(first_name) = 'CHUCK') OR LOWER(email_primary) = 'chuck.fisher2@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'PETERSON', '', '8065 W. FREMONT DR.', 'Littleton', 'CO', '80128', 'bp0451@comcast.net', '(720) 635-0451', 'RV TYPE= LANCE 2285 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PETERSON' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'bp0451@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bernie', 'WEIL', '', '9738 MULBERRY ST.', 'Littleton', 'CO', '80129', 'bernieweil@msn.com', '', 'RV TYPE= 2006 CRUISER VIEWFINDER 22''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEIL' AND UPPER(first_name) = 'BERNIE') OR LOWER(email_primary) = 'bernieweil@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicholas', 'CHAMBERS', '', '10667 CEDARCREST CIRCLE', 'Highlands Ranch', 'CO', '80130', 'chambers.na@gmail.com', '(707) 628-8706', 'RV TYPE= FR SALEM FSX 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHAMBERS' AND UPPER(first_name) = 'NICHOLAS') OR LOWER(email_primary) = 'chambers.na@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'DAVIS', '', '16418 MOUNTAIN MIST DR', 'Monument', 'CO', '80132', 'jeffdavisco@gmail.com', '(719) 287-8656', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeffdavisco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'GISI', '', '19820 CAPELLA DR.', 'Monument', 'CO', '80132', 'gisidesigns@gmail.com', '(303) 999-7445', 'RV TYPE= AS 30''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GISI' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'gisidesigns@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Linzi', 'PEHLER', '', '8685 W. TEZ CT.', 'Parker', 'CO', '80134', 'therunawayflorist@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PEHLER' AND UPPER(first_name) = 'LINZI') OR LOWER(email_primary) = 'therunawayflorist@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'STEELE', '', '17027 HASTINGS AVE.', 'Parker', 'CO', '80134', 'djsteele86@gmail.com', '(205) 937-7148', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEELE' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'djsteele86@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David & Amy', 'MENGES', '', '11037 PASTEL POINT', 'Parker', 'CO', '80134', 'amymenges@mac.com', '(303) 795-5557', 'RV TYPE= AS INTERNATIONAL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MENGES' AND UPPER(first_name) = 'DAVID & AMY') OR LOWER(email_primary) = 'amymenges@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'DUFFY', '', '18261 SHADBURY LANE', 'Parker', 'CO', '80134', 'duffy.kyle@gmail.com', '(720) 441-9759', 'RV TYPE= FR SALEM 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUFFY' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'duffy.kyle@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chad', 'CADWELL', '', '5198 PINYON JAY ROAD', 'Parker', 'CO', '80134', 'chad@freightlogisticsinc.com', '(720) 535-7923', 'RV TYPE= AS GLOBETROTTER 2022 | Alt phone: (303) 475-9145', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CADWELL' AND UPPER(first_name) = 'CHAD') OR LOWER(email_primary) = 'chad@freightlogisticsinc.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Harold', 'HIGGINS', '', '18263 KESWICK COURT', 'Parker', 'CO', '80134', 'nuzpaper@outlook.com', '(651) 283-7302', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HIGGINS' AND UPPER(first_name) = 'HAROLD') OR LOWER(email_primary) = 'nuzpaper@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'BOWKER', '', '6484 STROH ROAD', 'Parker', 'CO', '80134', 'brucebowker@hotmail.com', '(303) 517-8704', 'RV TYPE= KEYSTONE OUTBACK 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOWKER' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'brucebowker@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Charles', 'HEYNE', '', '8756 STARWOOD LANE', 'Parker', 'CO', '80134', 'cheyne@fc-tx.com', '(303) 990-1012', 'RV TYPE= GD IMAGINE 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HEYNE' AND UPPER(first_name) = 'CHARLES') OR LOWER(email_primary) = 'cheyne@fc-tx.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'KNUTH', '', '10219 ISLE ST.', 'Parker', 'CO', '80134', 'brian@raintreesales.com', '(303) 907-3080', 'RV TYPE= DUTCHMAN KODIAK 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KNUTH' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brian@raintreesales.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ray', 'DAVIS', '', '5933 RICHLAWN DR.', 'Parker', 'CO', '80134', '', '(970) 380-4307', 'RV TYPE= GD REFLECTION 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'RAY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Julie', 'LACERTE', '', '10251 ROWLOCK WAY', 'Parker', 'CO', '80134', 'jhlacerte@gmail.com', '(303) 809-1968', 'RV TYPE= AS INTERSTATE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LACERTE' AND UPPER(first_name) = 'JULIE') OR LOWER(email_primary) = 'jhlacerte@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Todd', 'EDDINGTON', '', '16031 RELIC ROCK TERRACE', 'Parker', 'CO', '80134', 'eddington.todd@comcast.net', '(720) 614-4845', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EDDINGTON' AND UPPER(first_name) = 'TODD') OR LOWER(email_primary) = 'eddington.todd@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mimi', 'LAST NAME', '', '6484 STROH ROAD', 'Parker', 'CO', '80134', 'info@creeksideequestrianco.com', '', 'RV TYPE= LEGACY 5TH WHEEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LAST NAME' AND UPPER(first_name) = 'MIMI') OR LOWER(email_primary) = 'info@creeksideequestrianco.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Manuel', 'SALGADO', '', '16350 BUCKTHORN LANE', 'Parker', 'CO', '80134', 'yvsalgado@live.com', '(720) 290-6798', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SALGADO' AND UPPER(first_name) = 'MANUEL') OR LOWER(email_primary) = 'yvsalgado@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dale & Sherri', 'SCHLOTZHAUER', '', '16098 E. TALL TIMBER LANE', 'Parker', 'CO', '80134', 'd.schlotzhauer@comcast.net', '(720) 244-4024', 'RV TYPE= AS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHLOTZHAUER' AND UPPER(first_name) = 'DALE & SHERRI') OR LOWER(email_primary) = 'd.schlotzhauer@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Charley', 'ELLIS', '', '21987 N. SIXTH ST.', 'Parker', 'CO', '80134', 'allprotree9@hotmail.com', '(720) 226-2195', 'RV TYPE= NOTH TRAIL 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ELLIS' AND UPPER(first_name) = 'CHARLEY') OR LOWER(email_primary) = 'allprotree9@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'GATES', '', '15849 STUMP ROAD', 'Sedalia', 'CO', '80135', 'classykelbel@gmail.com', '(406) 273-1254', 'RV TYPE= JAYCO GREYHAWK 31FS CLASS C', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GATES' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'classykelbel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin And Heidi', 'NEFF', '', '6912 RAINBOW CREEK ROAD', 'Sedalia', 'CO', '80135', 'neffracing16@gmail.com', '(720) 695-5071', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NEFF' AND UPPER(first_name) = 'KEVIN AND HEIDI') OR LOWER(email_primary) = 'neffracing16@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dean', 'MURDOCH', '', '12033 PASS ME BY ROAD', 'Strasburg', 'CO', '80136', 'dean.f.murdoch@usps.com', '(303) 587-3320', 'RV TYPE= FR WILDCAT 2003', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURDOCH' AND UPPER(first_name) = 'DEAN') OR LOWER(email_primary) = 'dean.f.murdoch@usps.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jonathan', 'STILL', '', '55535 E. APACHE PLACE', 'Strasburg', 'CO', '80136', 'john.still71@gmail.com', '(303) 551-3434', 'RV TYPE= KEYSTONE SPRINGDALE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STILL' AND UPPER(first_name) = 'JONATHAN') OR LOWER(email_primary) = 'john.still71@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'HARPER', '', '2774 HASKELL CT.', 'Watkins', 'CO', '80137', 'williamharper@hotmail.com', '(303) 870-2219', 'CUSTOMER HAS $100 DEDUCTIBLE | Alt email: claimspayment@pdsadm.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARPER' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'williamharper@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Casey', 'BURRIS', '', 'PO BOX 101', 'Watkins', 'CO', '80137', 'chi3fs88@yahoo.com', '(303) 720-2918', 'RV TYPE= JAYCO JAYLIGHT 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURRIS' AND UPPER(first_name) = 'CASEY') OR LOWER(email_primary) = 'chi3fs88@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chester', 'SNELL', '', '2565 HASKELL PLACE', 'Watkins', 'CO', '80137', 'chetsnell@gmail.com', '(303) 324-6827', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SNELL' AND UPPER(first_name) = 'CHESTER') OR LOWER(email_primary) = 'chetsnell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'BIRDSALL', '', '11030 FOREST HILLS DRIVE', 'Parker', 'CO', '80138', 'joebirdsall@gmail.com', '(720) 768-8334', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BIRDSALL' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'joebirdsall@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kenneth', 'WICK', '', '12117 BLACKWELL WAY', 'Parker', 'CO', '80138', 'ken.wick@live.com', '(303) 919-2793', 'RV TYPE= GD IMAGINE XLS 22''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WICK' AND UPPER(first_name) = 'KENNETH') OR LOWER(email_primary) = 'ken.wick@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ted', 'PFISTER', '', '11960 S. DRIFT LANE', 'Parker', 'CO', '80138', 'ted.pfister@gmail.com', '(407) 319-4621', 'RV TYPE= AS GLOBETROTTER 27FBT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PFISTER' AND UPPER(first_name) = 'TED') OR LOWER(email_primary) = 'ted.pfister@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kristina & Nelson', 'RITH', '', '2416 ELKHORN RANCH ST', 'Parker', 'CO', '80138', 'kristina.rith@gmail.com', '(303) 868-0293', 'Alt email: denverpropetsitting@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RITH' AND UPPER(first_name) = 'KRISTINA & NELSON') OR LOWER(email_primary) = 'kristina.rith@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jorge', 'SANCHEZ', '', '13177 FRANNYS WAY', 'Parker', 'CO', '80138', 'jsanc4@icloud.com', '(303) 514-3065', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANCHEZ' AND UPPER(first_name) = 'JORGE') OR LOWER(email_primary) = 'jsanc4@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin And Amy', 'MCCANN', '', '21422 E. WANDERLUST PLACE', 'Parker', 'CO', '80138', 'kevin.m.mccann@comcast.net', '(508) 400-7444', 'Alt phone: (508) 298-8494', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCANN' AND UPPER(first_name) = 'KEVIN AND AMY') OR LOWER(email_primary) = 'kevin.m.mccann@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'LANE', '', '8361 PINEY CREEK RD', 'Parker', 'CO', '80158', 'pineycreek2023@gmail.com', '(303) 522-8075', 'RV TYPE= AS 26RB FC 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LANE' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'pineycreek2023@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'PRICE', '', '1750 LITTLE RAVEN ST', 'Denver', 'CO', '80202', 'jim.price@gmail.com', '(650) 804-8078', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRICE' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jim.price@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerrold', 'HAUPTMAN', '', '1501 WAZEE ST.  #4C', 'Denver', 'CO', '80202', 'plhauptm@gmail.com', '(720) 320-7342', 'RV TYPE= AS INTERNATIONAL | Alt phone: (303) 601-5269', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAUPTMAN' AND UPPER(first_name) = 'JERROLD') OR LOWER(email_primary) = 'plhauptm@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kim', 'FRAME', '', '2955 INCA ST UNIT 3C', 'Denver', 'CO', '80202', 'kimframe@mac.com', '(202) 302-3133', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRAME' AND UPPER(first_name) = 'KIM') OR LOWER(email_primary) = 'kimframe@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mandy', 'STEPOWOY', '', '820 N. SHERMAN', 'Denver', 'CO', '80203', 'mstepowoy@gmail.com', '(440) 781-8409', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEPOWOY' AND UPPER(first_name) = 'MANDY') OR LOWER(email_primary) = 'mstepowoy@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bridgette', 'MOLLER', '', '124 N. SHERMAN ST.', 'Denver', 'CO', '80203', 'bridgette.moller@gmail.com', '(303) 956-3953', 'RV TYPE= SPRINTER 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOLLER' AND UPPER(first_name) = 'BRIDGETTE') OR LOWER(email_primary) = 'bridgette.moller@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'William', 'HOLT', '', '254 N. SHERMAN ST.', 'Denver', 'CO', '80203', 'williamholt0004@gmail.com', '(334) 319-3313', 'RV TYPE= VISTA GULFSTREAM 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLT' AND UPPER(first_name) = 'WILLIAM') OR LOWER(email_primary) = 'williamholt0004@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nathan', 'GULASH', '', '1132 CHEROKEE ST.', 'Denver', 'CO', '80204', 'extranrg@gmail.com', '(614) 441-2232', 'RV TYPE= AS GLOBETROTTER 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GULASH' AND UPPER(first_name) = 'NATHAN') OR LOWER(email_primary) = 'extranrg@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'VON GRABILL', '', '1600 LOWELL BLVD.', 'Denver', 'CO', '80204', 'mvongrabill@gmail.com', '(303) 817-0676', 'RV TYPE= AS BASECAMP 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VON GRABILL' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'mvongrabill@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marcia', 'GOLDSTEIN', '', '1350 LAWRENCE ST  #9A', 'Denver', 'CO', '80204', 'marciagold@msn.com', '(303) 324-7865', 'NO: 3231 R/O: Jul 6 2023 - 12:31 ID: 1 ******************** ******************** NO: 70106 R/O: Jun 12 2025 - 10:07 ID: 1 Prior Posted Date: 14 Aug 2024 ********************', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOLDSTEIN' AND UPPER(first_name) = 'MARCIA') OR LOWER(email_primary) = 'marciagold@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carrie', 'JUDAH', '', '140 W. 10TH AVE.  #1008', 'Denver', 'CO', '80204', 'judahcl@gmail.com', '(503) 351-8825', 'RV TYPE= AS GLOBETROTTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JUDAH' AND UPPER(first_name) = 'CARRIE') OR LOWER(email_primary) = 'judahcl@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amy', 'PANZA', '', '410 ACOMA ST  #108', 'Denver', 'CO', '80204', 'apanzarx@msn.com', '(720) 870-8233', 'RV TYPE= COACHMAN CATALINA 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PANZA' AND UPPER(first_name) = 'AMY') OR LOWER(email_primary) = 'apanzarx@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aaron', 'JACKS', '', '1100 CHEROKEE ST. #803', 'Denver', 'CO', '80204', 'aaron-j@comcast.net', '(720) 898-7195', 'RV TYPE= AS GLOBETROTTER 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JACKS' AND UPPER(first_name) = 'AARON') OR LOWER(email_primary) = 'aaron-j@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nathan', 'GULASH', '', '1132 CHEROKEE ST.', 'Denver', 'CO', '80204', 'extranrg@gmail.com', '(614) 441-2232', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GULASH' AND UPPER(first_name) = 'NATHAN') OR LOWER(email_primary) = 'extranrg@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicholas', 'PESHEK', '', '2737 N JOSEPHINE ST.', 'Denver', 'CO', '80205', 'nicholas.peshek@gmail.com', '(618) 567-3374', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PESHEK' AND UPPER(first_name) = 'NICHOLAS') OR LOWER(email_primary) = 'nicholas.peshek@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'AJLUNI', '', '3810 N. WILLIAMS', 'Denver', 'CO', '80205', 'markinship@gmail.com', '(303) 877-3752', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AJLUNI' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'markinship@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'ACUNA', '', '3334 N GAYLORD ST', 'Denver', 'CO', '80205', 'jacuna777@gmail.com', '(720) 232-8899', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ACUNA' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jacuna777@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'WARD', '', '1725 E 30TH AVE', 'Denver', 'CO', '80205', 'bill@livmobil.com', '(303) 668-4064', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WARD' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'bill@livmobil.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tony', 'CALDWELL', '', '3557 ADAMS ST', 'Denver', 'CO', '80205', 'tonybcaldwell@gmail.com', '(970) 409-0053', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CALDWELL' AND UPPER(first_name) = 'TONY') OR LOWER(email_primary) = 'tonybcaldwell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Callen', 'RIGGINS', '', '3839 E 26TH AVE. PARKWAY', 'Denver', 'CO', '80205', 'callen@riggins.io', '(443) 248-3031', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIGGINS' AND UPPER(first_name) = 'CALLEN') OR LOWER(email_primary) = 'callen@riggins.io');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'MCCRORY', '', '3835 ADAMS ST', 'Denver', 'CO', '80205', 'j_mccrory@msn .com', '(303) 547-0069', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCRORY' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'j_mccrory@msn .com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Melissa', 'THEESEN', '', '2524 N. WILLIAMS ST.', 'Denver', 'CO', '80205', 'melissa.theesen@gmail.com', '(720) 545-5254', 'NO: 70117 R/O: Jul 8 2024 - 13:47 ID: 1 ********************', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'THEESEN' AND UPPER(first_name) = 'MELISSA') OR LOWER(email_primary) = 'melissa.theesen@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dylan', 'LEIN', '', '3501 E 27TH AVE.', 'Denver', 'CO', '80205', 'dylan.lein@outlook.com', '(904) 318-0784', 'RV TYPE= AS BASECAMP', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEIN' AND UPPER(first_name) = 'DYLAN') OR LOWER(email_primary) = 'dylan.lein@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT '3839 E. 26Th Ave. Parkway', 'RIGGINS', '', '', 'Denver', 'CO', '80205', '', '(443) 248-3031', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIGGINS' AND UPPER(first_name) = '3839 E. 26TH AVE. PARKWAY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gordon', 'VAUGHAN', '', '191 UNIVERSITY BLVD. #464', 'Denver', 'CO', '80206', 'vaug@hotmail.com', '(919) 332-3696', 'RV TYPE= AS SAFARI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VAUGHAN' AND UPPER(first_name) = 'GORDON') OR LOWER(email_primary) = 'vaug@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Walter', 'JONES', '', '441 ADAMS', 'Denver', 'CO', '80206', 'wajones3rd@gmail.com', '(908) 377-5104', 'RV TYPE= AS CLASSIC', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JONES' AND UPPER(first_name) = 'WALTER') OR LOWER(email_primary) = 'wajones3rd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'FOX', '', '2900 E. 16TH AVE.', 'Denver', 'CO', '80206', 'lisa.fox@colorado.edu', '(720) 338-1230', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOX' AND UPPER(first_name) = 'LISA') OR LOWER(email_primary) = 'lisa.fox@colorado.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian/Dakota', 'OTOOLE/WALTERS', '', '1077 RACE ST', 'Denver', 'CO', '80206', 'otooleb93@gmail.com', '(720) 709-9893', 'Alt email: dakotawalters@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OTOOLE/WALTERS' AND UPPER(first_name) = 'BRIAN/DAKOTA') OR LOWER(email_primary) = 'otooleb93@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'O''HALLORAN', '', '2990 E 17TH AVE #1406', 'Denver', 'CO', '80206', 'tomohalloran303@gmail.com', '(720) 209-3693', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'O''HALLORAN' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'tomohalloran303@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joel', 'LYLES', '', '1218 GARFIELD ST', 'Denver', 'CO', '80206', 'joellyles33@gmail.com', '(720) 220-5553', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LYLES' AND UPPER(first_name) = 'JOEL') OR LOWER(email_primary) = 'joellyles33@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Karen', 'GRIFFIN', '', '626 DETROIT ST.', 'Denver', 'CO', '80206', 'griffin80206@gmail.com', '(303) 321-3661', 'RV TYPE= AS INTERSTATE GT  CUSTOMER JUST NEEDS STORAGE FOR 3-4 WEEKS - JAN 13, 2023', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRIFFIN' AND UPPER(first_name) = 'KAREN') OR LOWER(email_primary) = 'griffin80206@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gonzalo', 'LERNER', '', '1640 DTROIT ST', 'Denver', 'CO', '80206', 'gonzalo.lerner@gmail.com', '(720) 795-4659', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LERNER' AND UPPER(first_name) = 'GONZALO') OR LOWER(email_primary) = 'gonzalo.lerner@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'GRIFFIN', '', '626 DETROIT ST.', 'Denver', 'CO', '80206', 'ggg80206@gmail.com', '(303) 434-5207', 'RV TYPE= AS INTERSTATE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRIFFIN' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'ggg80206@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'MONTOYA', '', '1114 FILLMORE ST', 'Denver', 'CO', '80206', 'ohanahomesdenver@outlook.com', '(720) 936-9742', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTOYA' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'ohanahomesdenver@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alex', 'WITKOWICZ', '', '700 COLORADO BLVD # 264', 'Denver', 'CO', '80206', 'awitkowicz@gmail.com', '(774) 364-0010', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WITKOWICZ' AND UPPER(first_name) = 'ALEX') OR LOWER(email_primary) = 'awitkowicz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andy', 'KING', '', '3820 E. 4TH AVE.', 'Denver', 'CO', '80206', 'aking0711@gmail.com', '(303) 819-7785', 'RV TYPE= AS 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KING' AND UPPER(first_name) = 'ANDY') OR LOWER(email_primary) = 'aking0711@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shahir', 'AHMED', '', '600 YORK ST.', 'Denver', 'CO', '80206', 'shahir1980@gmail.com', '(720) 365-5714', 'RV TYPE= AS INTERSTATE 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AHMED' AND UPPER(first_name) = 'SHAHIR') OR LOWER(email_primary) = 'shahir1980@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Adam', 'WAITE', '', '1360 MONROE ST', 'Denver', 'CO', '80206', 'adamdwaite@gmail.com', '(862) 222-4628', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WAITE' AND UPPER(first_name) = 'ADAM') OR LOWER(email_primary) = 'adamdwaite@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Derek', 'CURTIS', '', '2840 LOCUST', 'Denver', 'CO', '80207', 'derek1c1c@aol.com', '(314) 750-0924', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CURTIS' AND UPPER(first_name) = 'DEREK') OR LOWER(email_primary) = 'derek1c1c@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trent', 'NESTMAN', '', '2520 DAHLIA ST', 'Denver', 'CO', '80207', 'tnestman@gmail.com', '(319) 331-9935', 'RV TYPE= AS CARAVEL 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NESTMAN' AND UPPER(first_name) = 'TRENT') OR LOWER(email_primary) = 'tnestman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bonnie', 'THOMPSON', '', '2928 ELM ST', 'Denver', 'CO', '80207', 'blthompson449@gmail.com', '(720) 363-5112', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'THOMPSON' AND UPPER(first_name) = 'BONNIE') OR LOWER(email_primary) = 'blthompson449@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rita', 'HARVEY', '', '4094 S. WISTERIA WAY', 'Denver', 'CO', '80207', 'johngalt5613@comcast.net', '(720) 325-4766', 'RV TYPE= AS FC', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HARVEY' AND UPPER(first_name) = 'RITA') OR LOWER(email_primary) = 'johngalt5613@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sam', 'PIPER', '', '3078 ALBIAN ST', 'Denver', 'CO', '80207', 'sladdpiper@gmail.com', '(413) 441-9121', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PIPER' AND UPPER(first_name) = 'SAM') OR LOWER(email_primary) = 'sladdpiper@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian & Debi', 'ELLIOTT', '', '2543 GRAPE ST.', 'Denver', 'CO', '80207', 'brian.elliott@msn.com', '(303) 321-6997', 'NO: 3566 R/O: Feb 6 2024 - 15:34 ID: 1 ******************** | Alt email: autosupplements@thehartford.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ELLIOTT' AND UPPER(first_name) = 'BRIAN & DEBI') OR LOWER(email_primary) = 'brian.elliott@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Logan', 'RIPLEY', '', '2310 ASH ST', 'Denver', 'CO', '80207', 'loganripley@gmail.com', '(970) 393-3415', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIPLEY' AND UPPER(first_name) = 'LOGAN') OR LOWER(email_primary) = 'loganripley@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cox', 'JOE', '', '3320 KRAMERIA ST.', 'Denver', 'CO', '80207', 'joeco79@gmail.com', '(773) 575-3835', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOE' AND UPPER(first_name) = 'COX') OR LOWER(email_primary) = 'joeco79@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stephen', 'CHUPP', '', '2815 DAHLIA ST', 'Denver', 'CO', '80207', 'schupp09@gmail.com', '(507) 923-5559', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHUPP' AND UPPER(first_name) = 'STEPHEN') OR LOWER(email_primary) = 'schupp09@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'HIGGINS', '', '2800 MAGNOLIA ST', 'Denver', 'CO', '80207', 'jlh:higgins@gmail.com', '(720) 425-9532', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HIGGINS' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'jlh:higgins@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Deana & Steve', 'CHUPP', '', '2815 DAHLIA ST', 'Denver', 'CO', '80207', 'dbchupp@gmail.com', '(810) 841-4719', 'Alt phone: (507) 923-5559', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHUPP' AND UPPER(first_name) = 'DEANA & STEVE') OR LOWER(email_primary) = 'dbchupp@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stacy', 'MCDONALD', '', '5022 MONTVIEW BLVD.', 'Denver', 'CO', '80207', 'milehighrealestatevaluations@gmail.com', '(303) 478-4763', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCDONALD' AND UPPER(first_name) = 'STACY') OR LOWER(email_primary) = 'milehighrealestatevaluations@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'JABLONKA', '', '559 S. GRANT ST', 'Denver', 'CO', '80209', 'djabl@yahoo.com', '(720) 272-5994', 'RV TYPE= AS FC 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JABLONKA' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'djabl@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Beau', 'WOODWARD', '', '1446 S. WASHINGTON ST.', 'Denver', 'CO', '80209', 'fredwood1207@gmail.com', '(303) 489-2686', 'RV TYPE= AS BASECAMP 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOODWARD' AND UPPER(first_name) = 'BEAU') OR LOWER(email_primary) = 'fredwood1207@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rob', 'OLSON', '', '1071 S CORONA ST', 'Denver', 'CO', '80209', 'trobolson@gmail.com', '(303) 522-6307', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OLSON' AND UPPER(first_name) = 'ROB') OR LOWER(email_primary) = 'trobolson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'TAPICK', '', '624 S York st', 'Denver', 'CO', '80209', 'jtapick@gmail.com', '(713) 252-5986', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAPICK' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jtapick@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Hollar', 'TODD', '', '1090 S MONROE', 'Denver', 'CO', '80209', 'todd_hollar@mindspring.com', '(720) 232-4971', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TODD' AND UPPER(first_name) = 'HOLLAR') OR LOWER(email_primary) = 'todd_hollar@mindspring.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Vincent', 'DIPASQUALE', '', '1062 S. CLAYTON WAY', 'Denver', 'CO', '80209', 'vincent_d@me.com', '(303) 406-8115', 'RV TYPE= SPRINTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DIPASQUALE' AND UPPER(first_name) = 'VINCENT') OR LOWER(email_primary) = 'vincent_d@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Josh', 'GONZALES', '', '492 S. PENNSYLVANIA', 'Denver', 'CO', '80209', 'joshua@tricorgrp.com', '(480) 292-1937', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GONZALES' AND UPPER(first_name) = 'JOSH') OR LOWER(email_primary) = 'joshua@tricorgrp.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ted', 'DYMAN', '', '248 S. LAFAYETTE ST.', 'Denver', 'CO', '80209', 'tsdman@gmail.com', '(303) 870-7916', 'RV TYPE= RAM VAN PROMASTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DYMAN' AND UPPER(first_name) = 'TED') OR LOWER(email_primary) = 'tsdman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eva & Gerry', 'EBNER', '', '191 S. PEARL ST.', 'Denver', 'CO', '80209', 'evaebner@msn.com', '(720) 935-6643', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EBNER' AND UPPER(first_name) = 'EVA & GERRY') OR LOWER(email_primary) = 'evaebner@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Susan', 'MIKULA', '', '1058 S. WASHINGTON ST.', 'Denver', 'CO', '80209', 's2sews@gmail.com', '(303) 548-6778', 'RV TYPE= VIEW 24J SPRINTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MIKULA' AND UPPER(first_name) = 'SUSAN') OR LOWER(email_primary) = 's2sews@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Laura', 'LUNDE', '', '782 S. VINE ST.', 'Denver', 'CO', '80209', 'lauralunde@comcast.net', '(303) 619-9696', 'RV TYPE= TAB 360', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUNDE' AND UPPER(first_name) = 'LAURA') OR LOWER(email_primary) = 'lauralunde@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Adam & Susi', 'EATON', '', '2821 E. CEDAR LANE #19', 'Denver', 'CO', '80209', 'adamreaton@gmail.com', '(720) 530-3202', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EATON' AND UPPER(first_name) = 'ADAM & SUSI') OR LOWER(email_primary) = 'adamreaton@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'STOTTS', '', '610 S. HIGH ST.', 'Denver', 'CO', '80209', 'matthew.j.stotts@gmail.com', '(423) 667-0817', 'Alt email: juliafeldmeier@gmail.com | Alt phone: (315) 415-2893', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STOTTS' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'matthew.j.stotts@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tristan', 'PELHAM WEBB', '', '1217 S. JOSEPHINE ST', 'Denver', 'CO', '80210', 'tpdubbs@gmail.com', '(303) 819-1410', 'Alt email: atrtestimates@allstate.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PELHAM WEBB' AND UPPER(first_name) = 'TRISTAN') OR LOWER(email_primary) = 'tpdubbs@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'DEAN', '', '2077 S. EMERSON ST.', 'Denver', 'CO', '80210', 'jwdeon47@gmail.com', '(303) 249-6979', 'RV TYPE= THOR VEGAS  2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEAN' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jwdeon47@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'HOLBROOK', '', '1393 S. YORK ST.', 'Denver', 'CO', '80210', 'rholbrookmail@gmail.com', '(303) 921-4317', 'RV TYPE= AS FLYING CLOUD 2011', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLBROOK' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'rholbrookmail@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'William (Cliff)', 'YECKES', '', '1700 S. PENNSYLVANIA ST.', 'Denver', 'CO', '80210', 'cliff.yeckes@gmail.com', '(303) 704-8154', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YECKES' AND UPPER(first_name) = 'WILLIAM (CLIFF)') OR LOWER(email_primary) = 'cliff.yeckes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Janet', 'JOHNSTON', '', '2101 S. PENNSYLVANIA ST', 'Denver', 'CO', '80210', 'jjohnston@savoryspiceshop.com', '(720) 480-4202', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSTON' AND UPPER(first_name) = 'JANET') OR LOWER(email_primary) = 'jjohnston@savoryspiceshop.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joshua', 'HAMILTON', '', '1449 S. HUMBOLT ST.', 'Denver', 'CO', '80210', 'jhamilton38@gmail.com', '(720) 575-6044', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAMILTON' AND UPPER(first_name) = 'JOSHUA') OR LOWER(email_primary) = 'jhamilton38@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'SIBBEL', '', '2270 CORONA ST.', 'Denver', 'CO', '80210', 'scott.sibbel@gmail.com', '(515) 249-4444', 'RV TYPE= AS 25FB 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SIBBEL' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'scott.sibbel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'MAY', '', '2550 S. FILLMORE ST.', 'Denver', 'CO', '80210', 'jmay83402@gmail.com', '(303) 888-7865', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAY' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jmay83402@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thuy Duong', 'NGUYEN', '', '1909 S. LINCOLN ST.', 'Denver', 'CO', '80210', 'duongco1973@gmail.com', '(303) 489-4732', 'RV TYPE= FR EPRO 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NGUYEN' AND UPPER(first_name) = 'THUY DUONG') OR LOWER(email_primary) = 'duongco1973@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'NILAND', '', '571 E ILIFF', 'Denver', 'CO', '80210', 'thomastwo13@gmail.com', '(512) 771-7709', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NILAND' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'thomastwo13@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'JOHNSON', '', '1845 S. CORONA ST.', 'Denver', 'CO', '80210', 'jeff@sageconstructionco.com', '(720) 323-7208', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeff@sageconstructionco.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'MOUNTS', '', '2795 S. GAYLORD ST.', 'Denver', 'CO', '80210', 'jasonmounts@gmail.com', '(303) 519-5185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOUNTS' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jasonmounts@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dustin', 'CHARAPATA', '', '2473 S. SHERMAN ST.', 'Denver', 'CO', '80210', 'dcharapata@bhfs.com', '(720) 891-8443', 'RV TYPE= AS BASECAMP 20X 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHARAPATA' AND UPPER(first_name) = 'DUSTIN') OR LOWER(email_primary) = 'dcharapata@bhfs.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anna', 'TIMM', '', '3121 UMATILLA ST', 'Denver', 'CO', '80211', 'annartimm@gmail.com', '(678) 327-3369', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TIMM' AND UPPER(first_name) = 'ANNA') OR LOWER(email_primary) = 'annartimm@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Clint', 'KRAJNIK', '', '2109 CLAY ST', 'Denver', 'CO', '80211', 'indianpeaks1@yahoo.com', '(303) 667-2672', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KRAJNIK' AND UPPER(first_name) = 'CLINT') OR LOWER(email_primary) = 'indianpeaks1@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nick', 'SKOWYRA', '', '3339 W 31ST', 'Denver', 'CO', '80211', 'nskowyra@gmail.com', '(651) 249-6673', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SKOWYRA' AND UPPER(first_name) = 'NICK') OR LOWER(email_primary) = 'nskowyra@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zach', 'FOX', '', '281 DEL NORTE ST', 'Denver', 'CO', '80211', 'zachfox4@gmail.com', '(970) 573-0230', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FOX' AND UPPER(first_name) = 'ZACH') OR LOWER(email_primary) = 'zachfox4@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jaime/Melissa', 'JIMENEZ/ORTEGA', '', '4554 RARITAN CT', 'Denver', 'CO', '80211', 'melissa.ortega777@gmail.com', '(720) 241-1207', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JIMENEZ/ORTEGA' AND UPPER(first_name) = 'JAIME/MELISSA') OR LOWER(email_primary) = 'melissa.ortega777@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Allison', 'WHITE', '', '4441 MEADE ST', 'Denver', 'CO', '80211', 'allison.white85@gmail.com', '(505) 239-7815', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITE' AND UPPER(first_name) = 'ALLISON') OR LOWER(email_primary) = 'allison.white85@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Walker', 'FENCI', '', '3444 NAVAJO ST.', 'Denver', 'CO', '80211', 'wfenci@gmail.com', '(972) 523-9641', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FENCI' AND UPPER(first_name) = 'WALKER') OR LOWER(email_primary) = 'wfenci@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Drew', 'WOLFE', '', '4640 PECOS ST. UNIT C', 'Denver', 'CO', '80211', 'drew@smartwirecabling.com', '(303) 396-9414', 'RV TYPE= AS INTERSTATE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOLFE' AND UPPER(first_name) = 'DREW') OR LOWER(email_primary) = 'drew@smartwirecabling.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marc', 'ARMINIO', '', '3365 W 32ND AVE', 'Denver', 'CO', '80211', 'marminio1983@yahoo.com', '(508) 353-6923', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARMINIO' AND UPPER(first_name) = 'MARC') OR LOWER(email_primary) = 'marminio1983@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shannon', 'BINGHAM', '', '5195 EATON ST.', 'Denver', 'CO', '80212', 'shanval73@hotmail.com', '(303) 803-4049', 'RV TYPE= CHEVY JAMBOREE 2007', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BINGHAM' AND UPPER(first_name) = 'SHANNON') OR LOWER(email_primary) = 'shanval73@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Katherine', 'CONYERS', '', '2500 RALEIGH ST.', 'Denver', 'CO', '80212', 'katieconyers@gmail.com', '(303) 503-8976', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CONYERS' AND UPPER(first_name) = 'KATHERINE') OR LOWER(email_primary) = 'katieconyers@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'RIGGS', '', '3301 TENNYSON ST.', 'Denver', 'CO', '80212', 'brianriggs.k@gmail.com', '(706) 881-1944', 'RV TYPE= ROCLWOOD 1995', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIGGS' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brianriggs.k@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'BRAUNTZ', '', '2450 QUITMAN ST', 'Denver', 'CO', '80212', 'gregbrauntz@yahoo.com', '(720) 297-7097', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRAUNTZ' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gregbrauntz@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'ERICSON', '', '2420 N. RALEIGH ST', 'Denver', 'CO', '80212', 'jim377er@aol.com', '(303) 882-8949', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ERICSON' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jim377er@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'INGRAHAM', '', '', 'Denver', 'CO', '80212', 'kevinjingraham@gmail.com', '(310) 971-7192', 'RV TYPE= SPRINTER 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'INGRAHAM' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kevinjingraham@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Deborah', 'PREMSELAAR', '', 'PO BOX 140845', 'Denver', 'CO', '80214', 'dlprems1899@gmail.com', '(303) 552-1734', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PREMSELAAR' AND UPPER(first_name) = 'DEBORAH') OR LOWER(email_primary) = 'dlprems1899@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'GARDNER', '', '1165 GAMSON ST', 'Lakewood', 'CO', '80215', 'jsgctt@gmail.com', '(303) 847-1673', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARDNER' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jsgctt@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aaron', 'LEVINE', '', '8600 W 10TH AVE.', 'Lakewood', 'CO', '80215', 'alevine84@gmail.com', '(617) 335-8730', 'RV TYPE= AS FC 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEVINE' AND UPPER(first_name) = 'AARON') OR LOWER(email_primary) = 'alevine84@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Terri', 'BRINDLEY', '', '12467 W. 16TH PLACE', 'Lakewood', 'CO', '80215', 'terri.brindley@me.com', '(303) 242-6220', 'RV TYPE= AS ATLAS 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRINDLEY' AND UPPER(first_name) = 'TERRI') OR LOWER(email_primary) = 'terri.brindley@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pamela', 'LYON', '', '11001 W 15TH PLACE', 'Lakewood', 'CO', '80215', 'lyoness3@gmail.com', '(970) 390-5690', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LYON' AND UPPER(first_name) = 'PAMELA') OR LOWER(email_primary) = 'lyoness3@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'NATSEWAY', 'BLAZY SUSAN', '6750 E. 46TH AVE. DRIVE #600', 'Denver', 'CO', '80216', 'dan@blazysusan.com', '(928) 606-5645', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NATSEWAY' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'dan@blazysusan.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'MINTER', '', '642 W. 43RD AVE.', 'Denver', 'CO', '80216', 'j.r.minter@comcast.net', '(303) 819-2042', 'RV TYPE= LANCE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MINTER' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'j.r.minter@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Antonio', 'LEDEZMA', '', '5335 HARRISON ST', 'Denver', 'CO', '80216', 'antoniol@ardenttraffic.com', '(303) 819-0606', 'Alt email: melissal@ardenttraffic.com | Alt phone: (303) 518-6088', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEDEZMA' AND UPPER(first_name) = 'ANTONIO') OR LOWER(email_primary) = 'antoniol@ardenttraffic.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Isaac', 'ODIM', '', '1453 N WILLIAMS ST', 'Denver', 'CO', '80218', 'isaacodim@gmail.com', '(307) 206-4277', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ODIM' AND UPPER(first_name) = 'ISAAC') OR LOWER(email_primary) = 'isaacodim@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alexandria', 'DULCHAVSKY', '', '1401 N HIGH ST.  APT 2', 'Denver', 'CO', '80218', 'agdulch@gmail.com', '(313) 520-0898', 'GOES BY ALI DULCH', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DULCHAVSKY' AND UPPER(first_name) = 'ALEXANDRIA') OR LOWER(email_primary) = 'agdulch@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'GARVIN', '', '617 MARION ST', 'Denver', 'CO', '80218', 'gegarvin617@gmail.com', '(303) 501-2214', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARVIN' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'gegarvin617@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'LEYVAS', '', '1619 S. NEWTON ST.', 'Denver', 'CO', '80219', 'joeleyvas@gmail.com', '(720) 454-8271', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEYVAS' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'joeleyvas@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sam & Jose', 'MAES / MERCADO', '', '1500 S. LOWELL BLVD.', 'Denver', 'CO', '80219', 'howlsmovingsalon@gmail.com', '(303) 642-6022', 'Alt phone: (623) 523-4523', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAES / MERCADO' AND UPPER(first_name) = 'SAM & JOSE') OR LOWER(email_primary) = 'howlsmovingsalon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Monica', 'BALLESTEROS', '', '974 S. RALEIGH ST.', 'Denver', 'CO', '80219', 'ballesterosmonica1@gmail.com', '(303) 642-6267', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BALLESTEROS' AND UPPER(first_name) = 'MONICA') OR LOWER(email_primary) = 'ballesterosmonica1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chad', 'THOMPSON', '', '1680 TENNYSEN ST.', 'Denver', 'CO', '80219', 'mtnmanchad@gmail.com', '(720) 628-7096', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'THOMPSON' AND UPPER(first_name) = 'CHAD') OR LOWER(email_primary) = 'mtnmanchad@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trevor', 'SHOLDERS', '', '2640 S. ZURICH CT.', 'Denver', 'CO', '80219', 'sholders@gmail.com', '(303) 641-4128', 'RV TYPE= KEYSTONE BULLET 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHOLDERS' AND UPPER(first_name) = 'TREVOR') OR LOWER(email_primary) = 'sholders@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brenda', 'RIOS', '', '2780 W. IRVINGTON PLACE', 'Denver', 'CO', '80219', 'barajassue@ymail.com', '(720) 365-3692', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIOS' AND UPPER(first_name) = 'BRENDA') OR LOWER(email_primary) = 'barajassue@ymail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lea Ann', 'PURVIS', '', '928 NEWPORT', 'Denver', 'CO', '80220', 'lapurvis@comcast.net', '(303) 859-3196', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PURVIS' AND UPPER(first_name) = 'LEA ANN') OR LOWER(email_primary) = 'lapurvis@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Susan', 'GARMANY', '', '1701 WABASH ST', 'Denver', 'CO', '80220', 'k9kidsnash2@yahoo.com', '(303) 709-8199', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARMANY' AND UPPER(first_name) = 'SUSAN') OR LOWER(email_primary) = 'k9kidsnash2@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rob & Michele', 'ZERBE', '', '1375 GRAPE ST', 'Denver', 'CO', '80220', 'robzerbe@mac.com', '(520) 661-6954', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZERBE' AND UPPER(first_name) = 'ROB & MICHELE') OR LOWER(email_primary) = 'robzerbe@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'VAETH', '', '4061 E 19TH AVE', 'Denver', 'CO', '80220', 'jvaeth64@gmail.com', '(303) 522-7962', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VAETH' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'jvaeth64@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lisa', 'GABORY', '', '4605 BATAVIA PL', 'Denver', 'CO', '80220', 'gabory21@hotmail.com', '(727) 420-1935', 'Alt email: warranty : andy.peachey@cruiserrv.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GABORY' AND UPPER(first_name) = 'LISA') OR LOWER(email_primary) = 'gabory21@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'WILLIS', '', '364 ASH ST', 'Denver', 'CO', '80220', 'jwillis@liveberkeley.com', '(303) 916-9139', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIS' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jwillis@liveberkeley.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kasey', 'LEARNED', '', '1551 KRAMERIA ST.', 'Denver', 'CO', '80220', 'kaseylearned@gmail.com', '(303) 564-2230', 'RV TYPE= FR GEOPRO 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEARNED' AND UPPER(first_name) = 'KASEY') OR LOWER(email_primary) = 'kaseylearned@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Casey', 'BLEEKER', '', '1350 Birch St', 'Denver', 'CO', '80220', 'casey@geekbleek.com', '(720) 467-3487', 'OUTDOOR STORAGE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BLEEKER' AND UPPER(first_name) = 'CASEY') OR LOWER(email_primary) = 'casey@geekbleek.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stephen', 'IVEY', '', '1332 BELLAIRE ST', 'Denver', 'CO', '80220', 'steveivey7@gmail.com', '(720) 341-7840', 'RV TYPE= AS FLYING CLOUD 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'IVEY' AND UPPER(first_name) = 'STEPHEN') OR LOWER(email_primary) = 'steveivey7@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carvis', 'POPE', '', '1744 SPRUCE ST', 'Denver', 'CO', '80220', 'popeiii@gmail.com', '(303) 359-9044', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'POPE' AND UPPER(first_name) = 'CARVIS') OR LOWER(email_primary) = 'popeiii@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'ADAIR', '', '1215 HUDSON ST.', 'Denver', 'CO', '80220', 'ckadair@gmail.com', '(816) 309-6310', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ADAIR' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'ckadair@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Fran', 'ROBINSON', '', '1659 PONTIAC', 'Denver', 'CO', '80220', 'groblaplata@hotmail.com', '(505) 793-2729', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROBINSON' AND UPPER(first_name) = 'FRAN') OR LOWER(email_primary) = 'groblaplata@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'ZOLLARS', '', '1834 MONACO PKWY', 'Denver', 'CO', '80220', 'gtoman73@comcast.net', '(720) 400-9501', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZOLLARS' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'gtoman73@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sam', 'DANE', '', '791 POPLAR ST', 'Denver', 'CO', '80220', 'dane5627@gmail.com', '(208) 661-2199', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DANE' AND UPPER(first_name) = 'SAM') OR LOWER(email_primary) = 'dane5627@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Peter', 'JUNEK', '', '1776 LEYDEN ST.', 'Denver', 'CO', '80220', 'petejunek@gmail.com', '(651) 324-3628', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JUNEK' AND UPPER(first_name) = 'PETER') OR LOWER(email_primary) = 'petejunek@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'HILL', '', '1246 CLERMONT ST.', 'Denver', 'CO', '80220', 'col2185@gmail.com', '(720) 771-7100', 'RV TYPE= KZ ESCAPE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HILL' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'col2185@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'MCLAUGHLIN', '', '2055 W. 53RD AVE.', 'Denver', 'CO', '80221', 'marklmclaughlin50@yahoo.com', '(303) 842-6444', 'RV TYPE= PACE ARROW', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCLAUGHLIN' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'marklmclaughlin50@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Viktor', 'EDSTROM', '', '1361 W. 67TH PLACE', 'Denver', 'CO', '80221', 'vikstig@gmail.com', '(720) 655-1220', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EDSTROM' AND UPPER(first_name) = 'VIKTOR') OR LOWER(email_primary) = 'vikstig@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shane', 'ZIMMERMAN', '', '2841 W. 65TH AVE', 'Denver', 'CO', '80221', 'zbackcountry@gmail.com', '(303) 882-5264', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZIMMERMAN' AND UPPER(first_name) = 'SHANE') OR LOWER(email_primary) = 'zbackcountry@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'REINKING', '', '6691 MARIPOSA CT', 'Denver', 'CO', '80221', 'reinkingmf@gmail.com', '(314) 680-3923', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REINKING' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'reinkingmf@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'JAMES', '', '580 MARIGOLD DR.', 'Denver', 'CO', '80221', 'davegjames@comcast.net', '(303) 356-7774', 'RV TYPE= COLEMAN 27'' 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JAMES' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'davegjames@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Oiseau', 'MONTEZ', '', '481 JENNIE DR.', 'Denver', 'CO', '80221', 'omontez@yahoo.com', '(720) 309-6370', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTEZ' AND UPPER(first_name) = 'OISEAU') OR LOWER(email_primary) = 'omontez@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'GLADBACH', '', '1919 S. DEXTER ST.', 'Denver', 'CO', '80222', 'fool4bluegrass@gmail.com', '(720) 244-1353', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GLADBACH' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'fool4bluegrass@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'BERNATOW', '', '16364 E. 117TH AVE.', 'Commerce City', 'CO', '80222', 'jeffbernatow@gmail.com', '(303) 916-4342', 'RV TYPE= JAYCO PRECEPT 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BERNATOW' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeffbernatow@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Karen', 'ELIAS', '', '5453 E. EASTMAN AVE.', 'Denver', 'CO', '80222', 'k_elias@comcast.net', '(303) 913-9505', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ELIAS' AND UPPER(first_name) = 'KAREN') OR LOWER(email_primary) = 'k_elias@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Amara Martin', 'DRESS FOR SUCCESS', '', '2594 S. COLORADO BLVD.', 'Denver', 'CO', '80222', 'denver@dressforsuccess.org', '(307) 220-8231', 'Alt email: claimsmail@insurancefornonprofits.org', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DRESS FOR SUCCESS' AND UPPER(first_name) = 'AMARA MARTIN') OR LOWER(email_primary) = 'denver@dressforsuccess.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'SMITH', '', '11653 JOSEPHINE ST.', 'Thornton', 'CO', '80223', 'seric295@gmail.com', '(720) 965-5581', 'RV TYPE= CATALINA 28DD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SMITH' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'seric295@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mak', 'MARTINEZ', '', '290 VALLEJO ST', 'Denver', 'CO', '80223', 'permits@plumbersv.com', '(720) 434-3406', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTINEZ' AND UPPER(first_name) = 'MAK') OR LOWER(email_primary) = 'permits@plumbersv.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'GIDDENS', '', '870 S. LIPAN ST.', 'Denver', 'CO', '80223', 'pat.pats.painting@gmail.com', '(720) 480-1639', 'RV TYPE= FR SURVEY 245 BHS 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GIDDENS' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'pat.pats.painting@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'GERINGER', '', '425 S.LOCUST ST.', 'Denver', 'CO', '80224', 'sabin2010@gmail.com', '(720) 363-6321', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GERINGER' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'sabin2010@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ramsey', 'STEWART', '', '954 S IVY ST', 'Denver', 'CO', '80224', 'ramstew2005@yahoo.com', '(303) 495-2589', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STEWART' AND UPPER(first_name) = 'RAMSEY') OR LOWER(email_primary) = 'ramstew2005@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tyler', 'TARR', '', '8420 W 1ST PLACE', 'Lakewood', 'CO', '80226', 'tylerjtarr@gmail.com', '(303) 304-7515', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TARR' AND UPPER(first_name) = 'TYLER') OR LOWER(email_primary) = 'tylerjtarr@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'SALAS', '', '180 SOUTH ALLISA ST.', 'Lakewood', 'CO', '80226', 'thomassalas@yahoo.com', '(720) 273-7318', 'RV TYPE= KEYSTONE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SALAS' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'thomassalas@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ted - Maribeth', 'SAMORA - GUSTAFSON', '', '11260 W FORD DRIVE', 'Lakewood', 'CO', '80226', 'mbgustafson@icloud.com', '(720) 281-7700', 'Alt phone: (303) 709-9166', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SAMORA - GUSTAFSON' AND UPPER(first_name) = 'TED - MARIBETH') OR LOWER(email_primary) = 'mbgustafson@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Freddy', 'PERELLO', '', '8161 W. EASTMAN PLACE#16-104', 'Lakewood', 'CO', '80227', 'fred_perello@hotmail.com', '(720) 260-3689', 'RV TYPE= NUCAMP TAB BOAT-RINKER 2002 20'' MONTEREY BOAT 25'' FOUR WINNS BOAT 24.5'' OUTOOR STORAGE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PERELLO' AND UPPER(first_name) = 'FREDDY') OR LOWER(email_primary) = 'fred_perello@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'SWARTZ', '', '10109 W DARTMOUTH PLACE #102', 'Denver', 'CO', '80227', 'mikeswartz18@gmail.com', '(303) 906-2001', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SWARTZ' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mikeswartz18@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Melinda', 'HOWES', '', '2817 S HARLAN WAY', 'Denver', 'CO', '80227', 'mlhowes@gmail.com', '(303) 717-9082', 'Alt phone: (720) 354-0863', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOWES' AND UPPER(first_name) = 'MELINDA') OR LOWER(email_primary) = 'mlhowes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Connie & Tracey', 'SHIREY', '', '7166 W. EVANS AVE.', 'Denver', 'CO', '80227', 'contra7166@gmail.com', '(720) 318-5106', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHIREY' AND UPPER(first_name) = 'CONNIE & TRACEY') OR LOWER(email_primary) = 'contra7166@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jacob', 'GERHARDT', '', 'PO BOX 27773', 'Denver', 'CO', '80227', 'jacobgerhardtdesign@gmail.com', '(847) 946-4821', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GERHARDT' AND UPPER(first_name) = 'JACOB') OR LOWER(email_primary) = 'jacobgerhardtdesign@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Keith', 'KIRCHUBEL', '', '8966 W. WOODARD DRIVE', 'Lakewood', 'CO', '80227', 'kejok2003@yahoo.com', '(303) 362-3801', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KIRCHUBEL' AND UPPER(first_name) = 'KEITH') OR LOWER(email_primary) = 'kejok2003@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sammy', 'HASAN', '', '13471 W. FLORIDA', 'Denver', 'CO', '80228', 'sshasan24@gmail.com', '(832) 409-8857', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HASAN' AND UPPER(first_name) = 'SAMMY') OR LOWER(email_primary) = 'sshasan24@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ray', 'HEIN', '', '10023 FRANKLIN ST.', 'Thornton', 'CO', '80229', 'trazor9861@gmail.com', '(303) 374-4696', 'RV TYPE= DYNAMAX 2001', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HEIN' AND UPPER(first_name) = 'RAY') OR LOWER(email_primary) = 'trazor9861@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joey', 'REALI', '', '1802 E. 99TH AVE', 'Denver', 'CO', '80229', 'realijoe@yahoo.com', '(720) 514-0557', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REALI' AND UPPER(first_name) = 'JOEY') OR LOWER(email_primary) = 'realijoe@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'CARRILLO', '', '1743 E. E. 100 TH PLACE', 'Denver', 'CO', '80229', 'bencarrillo80@hotmail.com', '(303) 908-0063', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARRILLO' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'bencarrillo80@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rod Or Terrilyn', 'PUGNETTI', '', '579 E. 76TH AVE', 'Denver', 'CO', '80229', 'pugs-9@hotmail.com', '(303) 903-0023', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PUGNETTI' AND UPPER(first_name) = 'ROD OR TERRILYN') OR LOWER(email_primary) = 'pugs-9@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jay', 'MARTINEZ', '', '1520 SOLANA DR.', 'Thornton', 'CO', '80229', 'mjm5691@gmail.com', '(720) 300-0480', 'RV TYPE= STRYKER 3112 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTINEZ' AND UPPER(first_name) = 'JAY') OR LOWER(email_primary) = 'mjm5691@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gerald', 'MAESTAS', '', '8751 PEARL ST. #61', 'Thornton', 'CO', '80229', 'grmaestas71@yahoo.com', '(303) 960-8551', 'RV TYPE= ALLIANCE AVENUE 32RLS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAESTAS' AND UPPER(first_name) = 'GERALD') OR LOWER(email_primary) = 'grmaestas71@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sarah', 'DOBJELESKI', '', '4367 E. 93RD AVE.', 'Thornton', 'CO', '80229', '', '(585) 354-8533', 'RV TYPE= CHEROKEE HORSE TRAILER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOBJELESKI' AND UPPER(first_name) = 'SARAH'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alberto Gonzalo', 'INDIE CAMPERS', '', '1724 E. 66TH AVE.', 'Denver', 'CO', '80229', '', '(720) 825-0072', 'WHAT''S APP NUMBER: +351 914974225 | Alt email: ted.dias@indiecampers.com | Alt phone: (213) 568-8580', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'INDIE CAMPERS' AND UPPER(first_name) = 'ALBERTO GONZALO'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'WOODIEL', '', '9894 HARRIS ST.', 'Thornton', 'CO', '80229', 'bradwoodiel@yahoo.com', '(303) 913-4719', 'RV TYPE= SPRINTER 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOODIEL' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'bradwoodiel@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jamie', 'HO', '', '7784 E 9TH AVE', 'Denver', 'CO', '80230', 'enginerd2000@yahoo.com', '(303) 625-3005', 'Alt email: savejamieho@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HO' AND UPPER(first_name) = 'JAMIE') OR LOWER(email_primary) = 'enginerd2000@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Levi', 'COOK', '', '7325 E CEDAR PLACE', 'Denver', 'CO', '80230', 'levicook@gmail.com', '(608) 320-0647', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COOK' AND UPPER(first_name) = 'LEVI') OR LOWER(email_primary) = 'levicook@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jose', 'MARTINEZ', '', '7343 E 7TH AVE.', 'Denver', 'CO', '80230', 'martinezjose912@gmail.com', '(720) 256-5831', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTINEZ' AND UPPER(first_name) = 'JOSE') OR LOWER(email_primary) = 'martinezjose912@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'KOBAYASHI', '', '1023 SPRUCE COURT', 'Denver', 'CO', '80230', 'thomas.koboyashi@gmail.com', '(303) 588-0499', 'Alt email: 4fullerfamily@gmail.com | Alt phone: (951) 741-5136', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOBAYASHI' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'thomas.koboyashi@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Billy', 'REDIESS', '', '175 RAMPART WAY #905', 'Denver', 'CO', '80230', 'billy@miterstouch.com', '(303) 595-9464', 'Alt email: joel@asbestosfree.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REDIESS' AND UPPER(first_name) = 'BILLY') OR LOWER(email_primary) = 'billy@miterstouch.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Timothy', 'PROW', '', '9340 E EASTMAN AVE', 'Denver', 'CO', '80231', 'timothyprow@gmail.com', '(720) 490-3947', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PROW' AND UPPER(first_name) = 'TIMOTHY') OR LOWER(email_primary) = 'timothyprow@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Wilson', 'PACE', '', '7804 E COLGATE PLACE', 'Denver', 'CO', '80231', 'wilson.pace@gmail.com', '(720) 334-6350', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PACE' AND UPPER(first_name) = 'WILSON') OR LOWER(email_primary) = 'wilson.pace@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cathy', 'RYAN', '', '8080 E DARTMOUTH AVE # 29', 'Denver', 'CO', '80231', 'cryanteach@gmail.com', '(303) 908-0171', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RYAN' AND UPPER(first_name) = 'CATHY') OR LOWER(email_primary) = 'cryanteach@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt & Liz', 'CARLSON', '', '8757 E. WESLEY DRIVE', 'Denver', 'CO', '80231', 'matthew.carlson23@gmail.com', '(571) 213-0016', 'RV TYPE= AS 27FB 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARLSON' AND UPPER(first_name) = 'MATT & LIZ') OR LOWER(email_primary) = 'matthew.carlson23@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cody', 'ROHR', '', '3780 JACKSON WAY', 'Thornton', 'CO', '80233', 'codyrohr33@gmail.com', '(720) 532-4705', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROHR' AND UPPER(first_name) = 'CODY') OR LOWER(email_primary) = 'codyrohr33@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin', 'CRANE', '', '2081 E 114TH PLACE', 'Denver', 'CO', '80233', 'squirlebmx@yahoo.com', '(720) 201-2882', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CRANE' AND UPPER(first_name) = 'JUSTIN') OR LOWER(email_primary) = 'squirlebmx@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patricia', 'RODGERS', '', '5028 E 106TH CIRCLE', 'Thornton', 'CO', '80233', 'camdenpatty@gmail.com', '(951) 440-0432', 'RV TYPE= SUPERLITE 2009', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RODGERS' AND UPPER(first_name) = 'PATRICIA') OR LOWER(email_primary) = 'camdenpatty@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ashley', 'SHERRILL', '', '11503 STEELE ST.', 'Thornton', 'CO', '80233', 'ashleybom@aol.com', '(207) 266-4116', 'RV TYPE= COLEMAN SEA PINE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHERRILL' AND UPPER(first_name) = 'ASHLEY') OR LOWER(email_primary) = 'ashleybom@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kristina', 'KRIESCHE', '', '4207 E. 113TH PL', 'Thornton', 'CO', '80233', 'headn4theclouds@yahoo.com', '(303) 591-9274', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KRIESCHE' AND UPPER(first_name) = 'KRISTINA') OR LOWER(email_primary) = 'headn4theclouds@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marcy', 'VILLARREAL', '', '11690 HOLLY ST', 'Thornton', 'CO', '80233', 'marcy7080@hotmail.com', '(303) 903-7709', 'RV TYPE= ALINER 18''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VILLARREAL' AND UPPER(first_name) = 'MARCY') OR LOWER(email_primary) = 'marcy7080@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dari', 'RAMIREZ', '', '10502 CLERMONT WAY', 'Thornton', 'CO', '80233', 'dramirez657@gmail.com', '(303) 204-7339', 'RV TYPE= GEARBOX FLEETWOOD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAMIREZ' AND UPPER(first_name) = 'DARI') OR LOWER(email_primary) = 'dramirez657@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Veronica', 'CHAVIS', '', '11755 ADAMS ST.', 'Thornton', 'CO', '80233', 'veraronirocks@msn.com', '(303) 587-3638', 'RV TYPE= COACHMAN 2001', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHAVIS' AND UPPER(first_name) = 'VERONICA') OR LOWER(email_primary) = 'veraronirocks@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ricky', 'GARCIA', '', '11460 HUDSON ST.', 'Thornton', 'CO', '80233', '', '(720) 261-7690', 'RV TYPE= GD IMAGINE2800 BH', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARCIA' AND UPPER(first_name) = 'RICKY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'BURKE', '', '10714 FILLMORE WAY', 'Northglen', 'CO', '80233', 'burkegram@gmail.com', '(303) 775-7715', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURKE' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'burkegram@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tami', 'CAVEN', '', '3351 E. 120TH AVE.', 'Thornton', 'CO', '80233', 'tcaven13@msn.com', '(303) 264-7611', 'RV TYPE= THOR FREEDOM ELITE 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CAVEN' AND UPPER(first_name) = 'TAMI') OR LOWER(email_primary) = 'tcaven13@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Adam', 'PODLESKI', '', '2844 E. 116TH PLACE', 'Thornton', 'CO', '80233', 'adampodleski@yahoo.com', '(425) 220-7507', 'RV TYPE= GD 247 BH 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PODLESKI' AND UPPER(first_name) = 'ADAM') OR LOWER(email_primary) = 'adampodleski@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kerri & Dave', 'REINHOLT', '', '11868 CHERRY DR.', 'Thornton', 'CO', '80233', 'wildflowrk@yahoo.com', '(303) 503-3589', 'RV TYPE= FR SUNSEEKER | Alt email: rhino7mag@yahoo.com | Alt phone: (720) 224-1102', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REINHOLT' AND UPPER(first_name) = 'KERRI & DAVE') OR LOWER(email_primary) = 'wildflowrk@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'CORCORAN', '', '11671 NEWTON ST', 'Westminster', 'CO', '80234', 'jeffcorcoran@yahoo.com', '(303) 478-0343', 'RV TYPE= AS CARAVEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CORCORAN' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeffcorcoran@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James (Jay)', 'COMMUSO', '', '940 W. 133RD RD. #P', 'Westminster', 'CO', '80234', 'jay@iprorep.com', '(720) 917-9390', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COMMUSO' AND UPPER(first_name) = 'JAMES (JAY)') OR LOWER(email_primary) = 'jay@iprorep.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'ADKINS', '', '10688 VARESE LANE', 'Northglenn', 'CO', '80234', 'rtothej@live.com', '(720) 753-2303', 'RV TYPE= FR ROCKWOOD ROO 2007', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ADKINS' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'rtothej@live.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Makena', 'ROESWOOD', '', '10658 UPTON ST.', 'Northglenn', 'CO', '80234', 'makena.roesch@gmail.com', '(720) 724-5110', 'RV TYPE= LANCE 2465  2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROESWOOD' AND UPPER(first_name) = 'MAKENA') OR LOWER(email_primary) = 'makena.roesch@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Heidi', 'HUEY', '', '1972 W 130TH AVE', 'Westminster', 'CO', '80234', 'haustin73@gmail.com', '(720) 313-4091', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUEY' AND UPPER(first_name) = 'HEIDI') OR LOWER(email_primary) = 'haustin73@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'BRENNER', '', '10450 WYANDOTSTREET', 'Denver', 'CO', '80234', 'ebrenner87@gmail.com', '(720) 742-0626', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRENNER' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'ebrenner87@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tawni', 'CUMMINGS', '', '6335 EMPORIA ST.', 'Denver', 'CO', '80236', 'tawnicummings@gmail.com', '(303) 359-1879', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CUMMINGS' AND UPPER(first_name) = 'TAWNI') OR LOWER(email_primary) = 'tawnicummings@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jovita', 'AMADOR', '', '8590 E UNION AVE.', 'Denver', 'CO', '80237', 'jovitans@aol.com', '(303) 725-5008', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AMADOR' AND UPPER(first_name) = 'JOVITA') OR LOWER(email_primary) = 'jovitans@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stuart', 'SCHWARTZ', '', '3780 S. DAHLIA ST.', 'Denver', 'CO', '80237', 'sschwartz999p@comcast.net', '(720) 630-0187', 'RV TYPE= COACHMAN CROSSFIT CLASS B 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHWARTZ' AND UPPER(first_name) = 'STUART') OR LOWER(email_primary) = 'sschwartz999p@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'ROGERS', '', '5042 S. WABASH ST.', 'Denver', 'CO', '80237', 'mrogers@la-rk.com', '(207) 266-8710', 'RV TYPE= COACHMAN 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROGERS' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'mrogers@la-rk.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eva', 'HAGG', '', '8209 STOLL PLACE', 'Denver', 'CO', '80238', 'eva.withers@gmail.com', '(720) 256-1251', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAGG' AND UPPER(first_name) = 'EVA') OR LOWER(email_primary) = 'eva.withers@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bret', 'BARBER', '', '7607 E 28TH AVE.', 'Denver', 'CO', '80238', 'oldbarbo@aol.com', '(505) 975-2032', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARBER' AND UPPER(first_name) = 'BRET') OR LOWER(email_primary) = 'oldbarbo@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brandon Long', 'TIFFANY COOVER', '', '9704 E 63RD DRIVE', 'Denver', 'CO', '80238', 'tiffany.coover@gmail.com', '(281) 780-1019', 'OUTDOOR STORAGE BRANDON LONG - PARTNER | Alt email: brandonclong@gmail.com | Alt phone: (864) 525-1102', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TIFFANY COOVER' AND UPPER(first_name) = 'BRANDON LONG') OR LOWER(email_primary) = 'tiffany.coover@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cory', 'FRAZIER', '', '2567 WABASH ST', 'Denver', 'CO', '80238', 'frazi231@gmail.com', '(303) 250-2991', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRAZIER' AND UPPER(first_name) = 'CORY') OR LOWER(email_primary) = 'frazi231@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'COLE', '', '3575 WABASH ST', 'Denver', 'CO', '80238', 'mike@theguruhouse.com', '(720) 413-6132', 'HAS TWO TRAILERS WANTS OUTDOOR STORAGE FOR BOTH', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLE' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mike@theguruhouse.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicolas', 'LUCO', '', '2840 EMPORIA CT.', 'Denver', 'CO', '80238', 'nico.luco@gmail.com', '(650) 814-7981', 'RV TYPE= AS SPORT 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUCO' AND UPPER(first_name) = 'NICOLAS') OR LOWER(email_primary) = 'nico.luco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tanner', 'APPLEGATE', '', '5863 ALTON ST.', 'Denver', 'CO', '80238', 'tanner.applegate@gmail.com', '(505) 860-9622', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'APPLEGATE' AND UPPER(first_name) = 'TANNER') OR LOWER(email_primary) = 'tanner.applegate@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lucas Ezekiel', 'VILLA', '', '8013 E. 50TH DR', 'Denver', 'CO', '80238', 'ezekielvilla@hotmail.com', '(719) 200-7878', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VILLA' AND UPPER(first_name) = 'LUCAS EZEKIEL') OR LOWER(email_primary) = 'ezekielvilla@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jon', 'KUIT', '', '6094 ALTON ST', 'Denver', 'CO', '80238', 'jonskuit@gmail.com', '(720) 919-5656', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUIT' AND UPPER(first_name) = 'JON') OR LOWER(email_primary) = 'jonskuit@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Debbie', 'JACOBS', '', '3185 ELMIRA ST.', 'Denver', 'CO', '80238', 'debbiejacobs5@gmail.com', '(314) 540-4519', 'RV TYPE= AS BASECAMP 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JACOBS' AND UPPER(first_name) = 'DEBBIE') OR LOWER(email_primary) = 'debbiejacobs5@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kim', 'KENYON', '', '8704 MARTIN LUTHER KING BLVD.', 'Denver', 'CO', '80238', 'kimlkenyon@hotmail.com', '(303) 475-1445', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KENYON' AND UPPER(first_name) = 'KIM') OR LOWER(email_primary) = 'kimlkenyon@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'MURCH', '', '3205 GALENA ST.', 'Denver', 'CO', '80238', 'jeffm365@gmail.com', '(757) 303-7248', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURCH' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jeffm365@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg', 'GARNER', '', '2765 TAMARAC ST.', 'Denver', 'CO', '80238', 'greg@garnerco.com', '(303) 619-5039', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARNER' AND UPPER(first_name) = 'GREG') OR LOWER(email_primary) = 'greg@garnerco.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Meagan', 'LONGORIA', '', '8228 E 24TH DRIVE', 'Denver', 'CO', '80238', 'longoria.meagan@gmail.com', '(816) 679-3390', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LONGORIA' AND UPPER(first_name) = 'MEAGAN') OR LOWER(email_primary) = 'longoria.meagan@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'WORKMAN', '', '5470 TAMARAC WAY', 'Denver', 'CO', '80238', 'timworkman01@gmail.com', '(303) 263-8015', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WORKMAN' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'timworkman01@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'HOWARD', '', '8958 E 59TH PLACE', 'Denver', 'CO', '80238', 'brad.howard77@gmail.com', '(303) 919-5180', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOWARD' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'brad.howard77@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maria', 'NAGEL', '', '2707 FLORENCE', 'Denver', 'CO', '80238', 'neuronagel@gmail.com', '(303) 520-1324', 'RV TYPE= GD IMAGINE MLE 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NAGEL' AND UPPER(first_name) = 'MARIA') OR LOWER(email_primary) = 'neuronagel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Byung', 'SON', '', '6291 N GATENA WAY', 'Denver', 'CO', '80238', 'bson702@gmail.com', '(907) 602-1502', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SON' AND UPPER(first_name) = 'BYUNG') OR LOWER(email_primary) = 'bson702@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alma/David', 'STAUB/LAMB', '', '8759 E 54TH AVE.', 'Denver', 'CO', '80238', 'davidatchleylamb@gmail.com', '(720) 988-0998', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STAUB/LAMB' AND UPPER(first_name) = 'ALMA/DAVID') OR LOWER(email_primary) = 'davidatchleylamb@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matthew', 'LINTON', '', '8597 E. 50TH DR.', 'Denver', 'CO', '80238', 'mlintonjd@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINTON' AND UPPER(first_name) = 'MATTHEW') OR LOWER(email_primary) = 'mlintonjd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'GOLDEN', '', '', 'Denver', 'CO', '80238', '', '(303) 618-7910', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOLDEN' AND UPPER(first_name) = 'PATRICK'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jon', 'SCHOEN', '', '9731 E 34TH PLACE', 'Denver', 'CO', '80238', 'jschoen01@yahoo.com', '(303) 358-1789', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHOEN' AND UPPER(first_name) = 'JON') OR LOWER(email_primary) = 'jschoen01@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carlin', 'HAGEMAN', '', '8456 E. 35TH AVE', 'Denver', 'CO', '80238', 'carlin.hageman4@gmail.com', '(319) 504-6126', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAGEMAN' AND UPPER(first_name) = 'CARLIN') OR LOWER(email_primary) = 'carlin.hageman4@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bob', 'HAVLEN', '', '3143 ELMIRA ST.', 'Denver', 'CO', '80238', 'rhavlen@earthlink.net', '(505) 307-8146', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAVLEN' AND UPPER(first_name) = 'BOB') OR LOWER(email_primary) = 'rhavlen@earthlink.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'STOCKMAN', '', '2351 XENIA ST', 'Denver', 'CO', '80238', 'garystockman@q.com', '(303) 669-7268', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STOCKMAN' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'garystockman@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Willy', 'BOUCHAREL', '', '6108 BEELER COURT', 'Denver', 'CO', '80238', 'boucharel@hotmail.com', '(720) 232-1522', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOUCHAREL' AND UPPER(first_name) = 'WILLY') OR LOWER(email_primary) = 'boucharel@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'KOCHIS', '', '2172 TAMARAC ST', 'Denver', 'CO', '80238', 'kylekochis@gmail.com', '(303) 501-2335', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOCHIS' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'kylekochis@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'BRISTOL', '', '5880 BOSTON ST.', 'Denver', 'CO', '80238', 'bristol.matthew458@gmail.com', '(720) 244-5724', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRISTOL' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'bristol.matthew458@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'REDDICK', '', '8522 E. 49TH PLACE', 'Denver', 'CO', '80238', 'bill.lee.reddick@gmail.com', '(208) 589-9866', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REDDICK' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'bill.lee.reddick@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'JOHNSON', '', '2636 GENEVA ST.', 'Denver', 'CO', '80238', 'glj@med.unc.edu', '(919) 619-5091', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'glj@med.unc.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zachary', 'PRUTCH', '', '5191 WILLOW WAY', 'Denver', 'CO', '80238', 'zprutch@yahoo.com', '(720) 341-4882', 'RV TYPE= COACHMAN CATALINA 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRUTCH' AND UPPER(first_name) = 'ZACHARY') OR LOWER(email_primary) = 'zprutch@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carla', 'WILLIAMS', '', '7777 23RD AVE. #1005', 'Denver', 'CO', '80238', 'spats0706@yahoo.com', '(720) 891-5867', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'CARLA') OR LOWER(email_primary) = 'spats0706@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'AVERY', '', '9118 E. 35TH PLACE', 'Denver', 'CO', '80238', 'averydanielr@gmail.com', '(303) 881-7405', 'RV TYPE= COLEMAN 17''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AVERY' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'averydanielr@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carl', 'WINTERMYER', '', '5457 UINTA ST.', 'Denver', 'CO', '80238', 'cwinfly@gmail.com', '(615) 796-7587', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WINTERMYER' AND UPPER(first_name) = 'CARL') OR LOWER(email_primary) = 'cwinfly@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'PATTON', '', '5473 N. XENIA ST.', 'Denver', 'CO', '80238', 'christopher.patton.rn@gmail.com', '(314) 477-2121', 'RV TYPE= AS BASECAMP 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PATTON' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'christopher.patton.rn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'SHIRLEY', '', '8750 MARTIN LUTHER KING BLVD', 'Denver', 'CO', '80238', 'kyle.shirley@gmail.com', '(303) 888-0599', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHIRLEY' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'kyle.shirley@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Monica', 'MINKEL', '', '2927 IRONTON ST', 'Denver', 'CO', '80238', 'frglvr2@yahoo.com', '(303) 522-6876', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MINKEL' AND UPPER(first_name) = 'MONICA') OR LOWER(email_primary) = 'frglvr2@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'KORINK', '', '5275 CENTRAL PARK BLVD', 'Denver', 'CO', '80238', 'chrisspade@gmail.com', '(443) 416-6105', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KORINK' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'chrisspade@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sergii', 'DOROSHCHUK', '', '5671 DAYTON ST', 'Denver', 'CO', '80238', 'serj1987@gmail.com', '(312) 972-4493', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOROSHCHUK' AND UPPER(first_name) = 'SERGII') OR LOWER(email_primary) = 'serj1987@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'ZAUGG', '', '2536 CENTRAL PARK BLVD', 'Denver', 'CO', '80238', 'bdzaugg@gmail.com', '(970) 708-8059', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZAUGG' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'bdzaugg@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'REED', '', '5531 WABASH ST.', 'Denver', 'CO', '80238', 'ericpreed@yahoo.com', '(970) 215-7185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REED' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'ericpreed@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'CHICKILLO', '', '5184 BOSTON CT.', 'Denver', 'CO', '80238', 'truthvendor@gmail.com', '(303) 579-2814', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHICKILLO' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'truthvendor@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gregory', 'LUNSFORD', '', '10107 E. 31ST AVE.', 'Denver', 'CO', '80238', 'glunsford303@gmail.com', '(757) 374-0410', 'RV TYPE= AS BASECAMP 16X', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LUNSFORD' AND UPPER(first_name) = 'GREGORY') OR LOWER(email_primary) = 'glunsford303@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anthony', 'CANFIELD', '', '3469 UNITA ST.', 'Denver', 'CO', '80238', 'ajcsurgeon@gmail.com', '(720) 556-7345', 'RV TYPE= AS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CANFIELD' AND UPPER(first_name) = 'ANTHONY') OR LOWER(email_primary) = 'ajcsurgeon@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sean', 'OSER', '', '5942 BOSTON CT', 'Denver', 'CO', '80238', 'seanoser@gmail.com', '(717) 552-6333', 'RV TYPE= AS BAMBI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OSER' AND UPPER(first_name) = 'SEAN') OR LOWER(email_primary) = 'seanoser@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eduardo', 'RODRIGUEZ', '', '5438 WORCHESTER ST', 'Denver', 'CO', '80239', 'keniayeduardo@gmail.com', '(220) 234-8893', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RODRIGUEZ' AND UPPER(first_name) = 'EDUARDO') OR LOWER(email_primary) = 'keniayeduardo@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jodi', 'HANSON', '', '14700 E. 43RD AVE.', 'Denver', 'CO', '80239', 'jodi.hanson04@gmail.com', '(720) 525-7812', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANSON' AND UPPER(first_name) = 'JODI') OR LOWER(email_primary) = 'jodi.hanson04@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'LEWIS', '', '4356 DENMARK CT.', 'Denver', 'CO', '80239', 'mic.lou54@gmail.com', '(720) 233-4025', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEWIS' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mic.lou54@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'SCHMID', '', '13594  GARFIEL WAY', 'Thornton', 'CO', '80241', 'johnschmid_23@msn.com', '(303) 875-5533', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHMID' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'johnschmid_23@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bennett', 'BOOTHE', '', '13205 MONROE WAY', 'Thornton', 'CO', '80241', 'bennettboothe@gmail.com', '(303) 882-3828', 'RV TYPE= MONTANA 5TH WHEEL 2011', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOOTHE' AND UPPER(first_name) = 'BENNETT') OR LOWER(email_primary) = 'bennettboothe@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Colby', 'WILLIAMS', '', '13148 CLAYTON WAY', 'Thornton', 'CO', '80241', 'bcwill1812@comcast.net', '(720) 318-8202', 'RV TYPE= DUTCHMAN ASTORIA 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'COLBY') OR LOWER(email_primary) = 'bcwill1812@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Troy', 'LEE', '', '4235 E 133RD PLACE', 'Thornton', 'CO', '80241', 'troykimlee@aol.com', '(720) 438-0492', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEE' AND UPPER(first_name) = 'TROY') OR LOWER(email_primary) = 'troykimlee@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christian & Sarah', 'DELEIN', '', '12953 HUDSON ST.', 'Thornton', 'CO', '80241', 'cjdelein@gmail.com', '(720) 238-6248', 'RV TYPE= HEARTLAND PIONEER 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DELEIN' AND UPPER(first_name) = 'CHRISTIAN & SARAH') OR LOWER(email_primary) = 'cjdelein@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick', 'HAMMER', '', '13884 LOCUST ST.', 'Thornton', 'CO', '80241', 'patrick.hammer@csuglobal.edu', '(720) 215-1775', 'RV TYPE= KZ ESCAPE 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HAMMER' AND UPPER(first_name) = 'PATRICK') OR LOWER(email_primary) = 'patrick.hammer@csuglobal.edu');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'SIEBEN', '', '12831 GARFIELD CIRCLE', 'Thornton', 'CO', '80241', 'tsieben61@icloud.com', '(303) 429-7777', 'RV TYPE= ROCKWOOD ROO 21DK 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SIEBEN' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'tsieben61@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alison', 'ROMAN', '', '13006 ASH ST.', 'Thornton', 'CO', '80241', 'alisonroman74@gmail.com', '(303) 638-5083', 'RV TYPE= AS BAMBI 16''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROMAN' AND UPPER(first_name) = 'ALISON') OR LOWER(email_primary) = 'alisonroman74@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eileen', 'ANDREWS', '', '12500 FIRST ST. UNIT 3', 'Thornton', 'CO', '80241', 'evgarcia3@msn.com', '(720) 276-1908', 'RV TYPE= 2017 FALCON 20''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ANDREWS' AND UPPER(first_name) = 'EILEEN') OR LOWER(email_primary) = 'evgarcia3@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Logan', 'SHELTON', '', '4180 E. 134TH DR.', 'Thornton', 'CO', '80241', 'lcsmedicalllc@gmail.com', '(303) 552-8951', 'RV TYPE= PACIFIC COACHWORKS 22''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHELTON' AND UPPER(first_name) = 'LOGAN') OR LOWER(email_primary) = 'lcsmedicalllc@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'HANSEN', '', '12916 HUDSON ST.', 'Thornton', 'CO', '80241', 'mdhansen1954@gmail.com', '(303) 885-0979', 'RV TYPE= GD IMAGINE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANSEN' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mdhansen1954@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'SCHLAHT', '', '12695 MADISON COURT', 'Thornton', 'CO', '80241', 'jgschlaht8614@gmail.com', '(303) 916-0571', 'RV TYPE= KEYSTONE CHALLENGER 5TH WHEEL 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHLAHT' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'jgschlaht8614@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'HANNEMAN', '', '12802 COLUMBINE CIRCLE', 'Thornton', 'CO', '80241', 'gahanne@bellsouth.net', '(985) 290-8473', 'RV TYPE= 2003 B PLUS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANNEMAN' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'gahanne@bellsouth.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'DYKE', '', '5125 E. ELLSWORTH AVE.', 'Denver', 'CO', '80246', 'chrisandankie@gmail.com', '(907) 382-2816', 'RV TYPE= AS INTERNATIONAL 2012', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DYKE' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'chrisandankie@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Leslie', 'GUERRERO', '', '9783 E. CAROLINA PLACE', 'Aurora', 'CO', '80247', 'sbrennan628@gmail.com', '(269) 998-8639', 'RV TYPE= PASSAGE MIDWEST 2021 | Alt email: lesliegrennan@gmail.com | Alt phone: (269) 370-8913', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GUERRERO' AND UPPER(first_name) = 'LESLIE') OR LOWER(email_primary) = 'sbrennan628@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'COLLINS', '', '9300 E. CENTER AVE #9C', 'Denver', 'CO', '80247', 'attybart@yahoo.com', '(909) 553-7031', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLLINS' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'attybart@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'HOBBS', '', '9057 E. MISSISSIPPI AVE.  #7-201', 'Denver', 'CO', '80247', '', '(831) 750-6668', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOBBS' AND UPPER(first_name) = 'DAVID'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jose', 'ORTEGA', '', '4908 DUNKIRK ST.', 'Denver', 'CO', '80249', 'jose@ortegalawnservice.com', '(720) 366-9280', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ORTEGA' AND UPPER(first_name) = 'JOSE') OR LOWER(email_primary) = 'jose@ortegalawnservice.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brianne', 'LOCH', '', '4390 MALAYA ST', 'Denver', 'CO', '80249', 'breg02@hotmail.com', '(701) 238-2721', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LOCH' AND UPPER(first_name) = 'BRIANNE') OR LOWER(email_primary) = 'breg02@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jose', 'CASILLAS', '', '20TH 333 E 40 PL', 'Denver', 'CO', '80249', 'jc35jose@hotmail.com', '(720) 936-4185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CASILLAS' AND UPPER(first_name) = 'JOSE') OR LOWER(email_primary) = 'jc35jose@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'KLEINPETER', '', '20554 E 47TH AVE', 'Denver', 'CO', '80249', 'dm7dlk@gmail.com', '(303) 489-7235', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KLEINPETER' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'dm7dlk@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James E', 'WOODS', '', '4262 IRAN ST', 'Denver', 'CO', '80249', 'jewoods56@comcast.net', '(303) 916-4354', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOODS' AND UPPER(first_name) = 'JAMES E') OR LOWER(email_primary) = 'jewoods56@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'JONES', '', '8943 E 58TH AVE', 'Denver', 'CO', '80258', 'chris@pineadvisorsolutions.com', '(908) 358-4289', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JONES' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'chris@pineadvisorsolutions.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lewis', 'DEHERRERA', '', '8675 MARIPOSA ST  APT 5-B', 'Thornton', 'CO', '80260', 'deherreralewis99@gmail.com', '(720) 766-9827', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEHERRERA' AND UPPER(first_name) = 'LEWIS') OR LOWER(email_primary) = 'deherreralewis99@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jamie', 'MORTENSEN', '', '845 W 97TH AVE', 'Northglenn', 'CO', '80260', '', '(303) 515-1506', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORTENSEN' AND UPPER(first_name) = 'JAMIE'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'WILLIAMS', '', '10333 FOX COURT', 'Northglenn', 'CO', '80260', 'bwlearnmaster35@yahoo.com', '(970) 769-6524', 'RV TYPE= KEYSTONE LAREDO 2017 HAS EXTENDED WARRANTY.  PHOENIX AMERICAN - 800-552-5135  63"  ARMS SOLARA  19 FOOT FABRIC.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'bwlearnmaster35@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'MONTOYA', '', '90521 GALE BLVD.', 'Thornton', 'CO', '80260', 'montoya.kevin21@gmail.com', '(720) 527-9898', 'RV TYPE= JAYCO JAYFEATHER 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MONTOYA' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'montoya.kevin21@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'HIRSCH', '', '9954 LANE ST', 'Thornton', 'CO', '80260', 'locomo22@gmail.com', '(970) 308-3394', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HIRSCH' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'locomo22@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'WILLIAMS', '', '10333 FOX COURT', 'Northglenn', 'CO', '80260', 'bwlearnmaster35@yahoo.com', '(970) 769-6524', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'bwlearnmaster35@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ned', 'DAVIS', '', '6726 W. EVANS AVE', 'Lakewood', 'CO', '80277', 'r.ned.davis@gmail.com', '(720) 891-5081', 'RV TYPE= FR HEMISPHERE 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DAVIS' AND UPPER(first_name) = 'NED') OR LOWER(email_primary) = 'r.ned.davis@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark & Amanda', 'KARGER', '', '8250 W. BAKER AVE.', 'Lakewood', 'CO', '80277', 'akargy@gmail.com', '(303) 618-1267', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KARGER' AND UPPER(first_name) = 'MARK & AMANDA') OR LOWER(email_primary) = 'akargy@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Arrian', 'WHEELER', '', '927 8TH ST.', 'Boulder', 'CO', '80302', 'safarisound@gmail.com', '(720) 966-8892', 'RV TYPE= THOR AXIS 27.7', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHEELER' AND UPPER(first_name) = 'ARRIAN') OR LOWER(email_primary) = 'safarisound@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jana', 'SUNSHINE', '', '5139 SUGARLOAF ROAD', 'Boulder', 'CO', '80302', 'jana.z.sunshine@gmail.com', '(323) 898-6199', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SUNSHINE' AND UPPER(first_name) = 'JANA') OR LOWER(email_primary) = 'jana.z.sunshine@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'OGDEN', '', '3827 SILVER PLUME CIR', 'Boulder', 'CO', '80302', 'aogden@indra.com', '(303) 818-9422', 'RV TYPE= AS SPORT 2005', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OGDEN' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'aogden@indra.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Katrina', 'MITCHELL', '', '2229 MARIPOSA AVE.', 'Boulder', 'CO', '80302', 'katrinlmitchell@gmail.com', '(303) 669-9905', 'RV TYPE= AS SPORT BAMBI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MITCHELL' AND UPPER(first_name) = 'KATRINA') OR LOWER(email_primary) = 'katrinlmitchell@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jon & Margot', 'MOELLENBERG', '', '1492 COLUMBINE AVE.', 'Boulder', 'CO', '80302', 'margotmoellenberg@gmail.com', '(303) 251-2172', 'RV TYPE= OPUS 4 AIR 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOELLENBERG' AND UPPER(first_name) = 'JON & MARGOT') OR LOWER(email_primary) = 'margotmoellenberg@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'HOWARTH', '', '275 KIOWA PLACE', 'Boulder', 'CO', '80303', 'richhowarth1@gmail.com', '(303) 517-1230', 'RV TYPE= AS BAMBI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOWARTH' AND UPPER(first_name) = 'RICHARD') OR LOWER(email_primary) = 'richhowarth1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Colin', 'COLLINS', '', '7714 BASELINE ROAD', 'Boulder', 'CO', '80303', 'cmjac13@msn.com', '(303) 386-2548', 'RV TYPE= KEYSTONE 28'' 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COLLINS' AND UPPER(first_name) = 'COLIN') OR LOWER(email_primary) = 'cmjac13@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Royce', 'PAYNE', '', '1511 48TH ST.', 'Boulder', 'CO', '80303', 'rolls3126@comcast.net', '(303) 881-8119', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PAYNE' AND UPPER(first_name) = 'ROYCE') OR LOWER(email_primary) = 'rolls3126@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelley', 'WEAR', '', '213 SEMINOLE DR.', 'Boulder', 'CO', '80303', 'surgery9@hotmail.com', '(720) 879-1891', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEAR' AND UPPER(first_name) = 'KELLEY') OR LOWER(email_primary) = 'surgery9@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Judy', 'BOX', '', '262 S 68TH ST.', 'Boulder', 'CO', '80303', 'judybox@comcast.net', '(303) 819-0228', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOX' AND UPPER(first_name) = 'JUDY') OR LOWER(email_primary) = 'judybox@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Orri', 'JONSSON', '', '225 SEMINOLE DR.', 'Boulder', 'CO', '80303', 'orri.jonsson@gmail.com', '(970) 232-6864', 'RV TYPE= CAPRI 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JONSSON' AND UPPER(first_name) = 'ORRI') OR LOWER(email_primary) = 'orri.jonsson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lennon', 'BARNICA', '', '4140 HUNT CT.', 'Boulder', 'CO', '80303', 'lennon@wildmanor.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARNICA' AND UPPER(first_name) = 'LENNON') OR LOWER(email_primary) = 'lennon@wildmanor.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'LETTMANN', '', '1745 SUNSET BLVD', 'Boulder', 'CO', '80304', 'jlettmann@gmail.com', '(650) 862-7731', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LETTMANN' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jlettmann@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Martin', 'SLOVACEK', '', '465 LARAMIE BLVD.', 'Boulder', 'CO', '80304', 'martin_slovacek@yahoo.com', '(720) 304-3291', 'RV TYPE= AS BAMBI', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SLOVACEK' AND UPPER(first_name) = 'MARTIN') OR LOWER(email_primary) = 'martin_slovacek@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'PASSALACQUA', '', '2811 20TH ST.', 'Boulder', 'CO', '80304', 'jopasta56@gmail.com', '(303) 834-2494', 'RV TYPE= AS BAMBI 1999', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PASSALACQUA' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'jopasta56@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Willard', 'HANZLIK', '', '1566 SUNSET BLVD.', 'Boulder', 'CO', '80304', 'whanzlik@mac.com', '(512) 656-4131', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANZLIK' AND UPPER(first_name) = 'WILLARD') OR LOWER(email_primary) = 'whanzlik@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aquiles', 'LA GRAVE', '', '3505 BROADWAY', 'Boulder', 'CO', '80304', 'alagrave@me.com', '(720) 503-0791', 'RV TYPE= AS BAMBI 20 FB 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LA GRAVE' AND UPPER(first_name) = 'AQUILES') OR LOWER(email_primary) = 'alagrave@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'MAZONSON', '', '3466 IRIS COURT', 'Boulder', 'CO', '80304', 'pmazonson@gmail.com', '(978) 314-1301', 'RV TYPE= AS BASECAMP 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAZONSON' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'pmazonson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'CROUCH', '', '1505 MAPLETON AVE', 'Boulder', 'CO', '80304', 'james@helixpet.com', '(303) 819-6030', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CROUCH' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'james@helixpet.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Terry', 'RODRIGUE', '', '2591 4TH ST.', 'Boulder', 'CO', '80304', 'terry28715@outlook.com', '(303) 549-7776', 'RV TYPE= AS CARAVEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RODRIGUE' AND UPPER(first_name) = 'TERRY') OR LOWER(email_primary) = 'terry28715@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Darren', 'SLATTERY', '', '3510 16TH STREET', 'Boulder', 'CO', '80304', 'dslat@coolerclips.com', '(781) 910-1820', 'will be filing an insurance claim for a panel, window and bumper | Alt email: atrtestimates@allstate.com | Alt phone: (800) 359-5516', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SLATTERY' AND UPPER(first_name) = 'DARREN') OR LOWER(email_primary) = 'dslat@coolerclips.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'SJOSTROM', '', '1075 MIAMI WAY', 'Boulder', 'CO', '80305', 'jwsjostrom@yahoo.com', '(708) 704-8313', 'RV TYPE= NUCAMP TAB 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SJOSTROM' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'jwsjostrom@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Harmon', 'ZUCKERMAN', '', '280 30TH ST', 'Boulder', 'CO', '80305', 'harmonzman@gmail.com', '(720) 357-4294', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZUCKERMAN' AND UPPER(first_name) = 'HARMON') OR LOWER(email_primary) = 'harmonzman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'MATTHEWS', '', 'PO BOX 3192', 'Boulder', 'CO', '80307', 'mben12@gmail.com', '(720) 443-3872', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MATTHEWS' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'mben12@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'THEOBALD', '', '7166 E 50TH AVE.', 'Denver', 'CO', '80328', 'jason@denverwellness.com', '(608) 347-3309', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'THEOBALD' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jason@denverwellness.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Beverly', 'CLEM', '', '16185 W 13TH PLACE', 'Golden', 'CO', '80401', 'mmite50@yahoo.com', '(720) 209-6272', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLEM' AND UPPER(first_name) = 'BEVERLY') OR LOWER(email_primary) = 'mmite50@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'HOFFMAN', '', '14055 FOOTHILL CIRCLE', 'Golden', 'CO', '80401', 'paul@greenskybluegrass.com', '(269) 267-4772', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOFFMAN' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'paul@greenskybluegrass.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike & Elisa', 'BRANVOLD', '', '1354 SNOWBERRY DRIVE', 'Golden', 'CO', '80401', 'mbranvold72@gmail.com', '(303) 589-4082', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRANVOLD' AND UPPER(first_name) = 'MIKE & ELISA') OR LOWER(email_primary) = 'mbranvold72@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff & Caryn', 'HERMAN', '', '1713 SAND LILY DR', 'Golden', 'CO', '80401', 'jeffscottherman@icloud.com', '(612) 384-3919', 'RV TYPE= AS TOMMY BAHAMA | Alt phone: (612) 695-3920', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HERMAN' AND UPPER(first_name) = 'JEFF & CARYN') OR LOWER(email_primary) = 'jeffscottherman@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jesse', 'SANDOVAL', '', '14010 BRAUN RD', 'Golden', 'CO', '80401', 'jsandevil@yahoo.com', '(303) 994-6694', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDOVAL' AND UPPER(first_name) = 'JESSE') OR LOWER(email_primary) = 'jsandevil@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kirk', 'JORGENSEN', '', '1930 ZIRNIE', 'Golden', 'CO', '80401', 'jorgensen.kirk@gmail.com', '(414) 426-8032', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JORGENSEN' AND UPPER(first_name) = 'KIRK') OR LOWER(email_primary) = 'jorgensen.kirk@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rick', 'ANGELL', '', '13866 W. SECOND AVE.', 'Golden', 'CO', '80401', 'rangell8122@gmail.com', '(303) 589-8122', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ANGELL' AND UPPER(first_name) = 'RICK') OR LOWER(email_primary) = 'rangell8122@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'MORTON', '', '19075 W 53RD PLACE', 'Golden', 'CO', '80403', 'jmorton1010@gmail.com', '(303) 246-9577', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORTON' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jmorton1010@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jarrod', 'KING', '', '4885 QUAKER LANE', 'Golden', 'CO', '80403', 'jarrodkingmd@gmail.com', '(720) 236-6688', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KING' AND UPPER(first_name) = 'JARROD') OR LOWER(email_primary) = 'jarrodkingmd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'MEYER', '', '9004 FERN WAY', 'Golden', 'CO', '80403', 'ctmsimmy@comcast.net', '(303) 378-3903', 'RV TYPE= AS INTERSTATE 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MEYER' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'ctmsimmy@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Leslie Pittman', 'JOHN MAYLIE', '', '19654 W 58TH PLACE', 'Golden', 'CO', '80403', 'johnmaylie@gmail.com', '(571) 338-9925', 'Alt phone: (303) 808-4758', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHN MAYLIE' AND UPPER(first_name) = 'LESLIE PITTMAN') OR LOWER(email_primary) = 'johnmaylie@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'LEVESQUE', '', '215 IOWA DR.', 'Golden', 'CO', '80403', '207scott@gmail.com', '(720) 339-3091', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LEVESQUE' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = '207scott@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jill & Ken', 'JOHNSON/TAKAHASHI', '', '5608 GORE RANGE WAY', 'Golden', 'CO', '80403', 'jillymc.vnw@gmail.com', '(225) 772-6706', 'RV TYPE= AS FLYING CLOUD 2019 | Alt phone: (720) 530-5190', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JOHNSON/TAKAHASHI' AND UPPER(first_name) = 'JILL & KEN') OR LOWER(email_primary) = 'jillymc.vnw@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stacy', 'HORNING', '', '13166 BIRCH WAY', 'Thornton', 'CO', '80421', 'dshorning@comcast.net', '(303) 460-6955', 'RV TYPE= FR  RPOD 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HORNING' AND UPPER(first_name) = 'STACY') OR LOWER(email_primary) = 'dshorning@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve-Karen', 'WEST', '', 'PO BOX 788', 'Breckenridge', 'CO', '80424', 'brekwest@me.com', '(970) 389-5048', 'RV TYPE= AS FLYING CLOUD 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEST' AND UPPER(first_name) = 'STEVE-KAREN') OR LOWER(email_primary) = 'brekwest@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lou', 'REYNOLDS', '', 'PO BOX 2457', 'Breckenridge', 'CO', '80424', 'lou@peakx.com', '(970) 470-5145', 'RV TYPE= AS BASECAMP 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REYNOLDS' AND UPPER(first_name) = 'LOU') OR LOWER(email_primary) = 'lou@peakx.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'HOWES', '', '85 REVETT DRIVE #101', 'Breckenridge', 'CO', '80424', 'kbhowes@gmail.com', '(302) 559-7171', 'RV TYPE= AS INTERNATIONAL 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOWES' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kbhowes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Garth', 'OLIVERIA', '', '26904 GREY MOOSE TRAIL', 'Conifer', 'CO', '80433', 'garth@oliveria.com', '(303) 884-9569', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OLIVERIA' AND UPPER(first_name) = 'GARTH') OR LOWER(email_primary) = 'garth@oliveria.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sue', 'MURPHREE', '', '12090 TECUMSEH TRAIL', 'Conifer', 'CO', '80433', '', '(480) 338-1136', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURPHREE' AND UPPER(first_name) = 'SUE'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Doug', 'GOODFEATHER', '', '12394 BEAR DEN LN', 'Conifer', 'CO', '80433', '', '(720) 276-7558', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOODFEATHER' AND UPPER(first_name) = 'DOUG'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris & Denise', 'WHITE', '', '13432 RILEY PEAK ROAD', 'Conifer', 'CO', '80433', 'chriswwhite5@gmail.com', '(630) 669-9125', 'Alt email: wheatonwhites@gmail.com | Alt phone: (630) 567-8109', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITE' AND UPPER(first_name) = 'CHRIS & DENISE') OR LOWER(email_primary) = 'chriswwhite5@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nevin', 'MILLS', '', '24840 STARVIEW DR.', 'Conifer', 'CO', '80433', 'rm.lt5vet@gmail.com', '(720) 402-4580', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MILLS' AND UPPER(first_name) = 'NEVIN') OR LOWER(email_primary) = 'rm.lt5vet@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry', 'GEORGE', '', 'PO BOX 5070', 'Dillon', 'CO', '80435', 'larrygeorge1@comcast.net', '(970) 470-0312', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GEORGE' AND UPPER(first_name) = 'LARRY') OR LOWER(email_primary) = 'larrygeorge1@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'COUGHLIN', '', 'PO BOX 884', 'Evergreen', 'CO', '80437', 'eaglecoughlin@gmail.com', '(303) 903-5194', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COUGHLIN' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'eaglecoughlin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kelly', 'SHELTON', '', '142 OUTPOST LANE', 'Evergreen', 'CO', '80439', 'kellycshelton@comcast.net', '(303) 880-0694', 'RV TYPE= OMEGA WARRIOR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHELTON' AND UPPER(first_name) = 'KELLY') OR LOWER(email_primary) = 'kellycshelton@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'MARDOSZ', '', '29596 TARGHEE LANE', 'Evergreen', 'CO', '80439', 'michael.mardosz@gmail.com', '(818) 746-6457', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARDOSZ' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'michael.mardosz@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nancy/Peter', 'KOSTRO/FURNESS', '', '2831 INTERLOCKEN DR.', 'Evergreen', 'CO', '80439', 'nkostro@yahoo.com', '(303) 704-1818', 'RV TYPE= AS BASECAMP | Alt phone: (303) 995-3234', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOSTRO/FURNESS' AND UPPER(first_name) = 'NANCY/PETER') OR LOWER(email_primary) = 'nkostro@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sean', 'JACKMAN', '', '31873 SNOWSHOE ROAD', 'Evergreen', 'CO', '80439', 'jackman.sean@gmail.com', '(443) 957-5150', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JACKMAN' AND UPPER(first_name) = 'SEAN') OR LOWER(email_primary) = 'jackman.sean@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tami/Tim', 'KLEBAN/JONES', '', '29656 BUFFALO PARK ROAD', 'Evergreen', 'CO', '80439', 'tbkleban@msn.com', '(303) 229-5163', 'Alt email: wellnesstim94@gmail.com | Alt phone: (303) 910-7360', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KLEBAN/JONES' AND UPPER(first_name) = 'TAMI/TIM') OR LOWER(email_primary) = 'tbkleban@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'YEARSLEY', '', '2087 WIELER RD', 'Evergreen', 'CO', '80439', 'byearsley85@gmail.com', '(303) 378-7200', 'RV TYPE= AS INTERNATIONAL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YEARSLEY' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'byearsley85@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shari', 'BRINN', '', '5821 CLIFF ROAD', 'Evergreen', 'CO', '80439', 'bellbrinn@aol.com', '(303) 519-7317', 'Alt phone: (303) 523-8369', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRINN' AND UPPER(first_name) = 'SHARI') OR LOWER(email_primary) = 'bellbrinn@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'RUMAN', '', '2238 HIWAN DR', 'Evergreen', 'CO', '80439', 'bradley.ruman@gmail.com', '(312) 848-2017', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUMAN' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'bradley.ruman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Claudia', 'YEARSLEY', '', '2087 WIELER RD', 'Evergreen', 'CO', '80439', 'claudiamy12@gmail.com', '(303) 324-3700', 'RV TYPE= KEYSTONE  OUTBACK 27'' 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YEARSLEY' AND UPPER(first_name) = 'CLAUDIA') OR LOWER(email_primary) = 'claudiamy12@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lawrence', 'FLOWERS', '', '30648 ISENBURG LANE', 'Evergreen', 'CO', '80439', 'larryflowers777@gmail.com', '(720) 635-4741', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FLOWERS' AND UPPER(first_name) = 'LAWRENCE') OR LOWER(email_primary) = 'larryflowers777@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'FROST', '', '24674 CHRIS DR.', 'Evergreen', 'CO', '80439', 'david_frost@hotmail.com', '(303) 301-4411', 'RV TYPE= AS 20FD 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FROST' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'david_frost@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anne', 'PATERSON', '', '33639 INVERNESS DR.', 'Evergreen', 'CO', '80439', 'anne.paterson@gmail.com', '(202) 299-4868', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PATERSON' AND UPPER(first_name) = 'ANNE') OR LOWER(email_primary) = 'anne.paterson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shelly And Russ', 'HOUSTON', '', '4092 TIMBERVALE DR.', 'Evergreen', 'CO', '80439', 'russ@risinggraphics.com', '(303) 674-7604', 'Alt email: studioat7199@gmail.com | Alt phone: (303) 697-6290', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOUSTON' AND UPPER(first_name) = 'SHELLY AND RUSS') OR LOWER(email_primary) = 'russ@risinggraphics.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'RETTERER', '', '5937 S. BROOK FOREST RD  UNIT A', 'Evergreen', 'CO', '80439', 'davidretterer@gmail.com', '(720) 331-1646', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RETTERER' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'davidretterer@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'CLARK', '', 'PO BOX 510', 'Frisco', 'CO', '80443', 'chris.clark@totalcoachingsystems.com', '(443) 359-1078', 'RV TYPE= AS 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLARK' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'chris.clark@totalcoachingsystems.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'MCQUILKIN', '', 'PO BOX 1861', 'Granby', 'CO', '80446', 'steve4hockey@yahoo.com', '(720) 301-2083', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCQUILKIN' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'steve4hockey@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rod And Clarisse', 'MCGOWAN', '', 'PO BOX 995', 'Granby', 'CO', '80446', 'rod.mcgowan@outlook.com', '(970) 509-0439', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCGOWAN' AND UPPER(first_name) = 'ROD AND CLARISSE') OR LOWER(email_primary) = 'rod.mcgowan@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Patrick & Catie', 'MAXWELL', '', '255 DIVIDE VIEW DR.', 'Idaho Springs', 'CO', '80452', 'maxwell.p@gmx.com', '(254) 718-3272', 'RV TYPE= AS CARAVEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAXWELL' AND UPPER(first_name) = 'PATRICK & CATIE') OR LOWER(email_primary) = 'maxwell.p@gmx.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chandler', 'WILLIAMS', '', '23546 NAVAJO ROAD', 'Indian Hills', 'CO', '80454', 'chandlerwilliams11@gmail.com', '(415) 407-4004', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'CHANDLER') OR LOWER(email_primary) = 'chandlerwilliams11@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'BAIN', '', 'PO BOX 358', 'Indian Hills', 'CO', '80454', 'scottandlisabain@gmail.com', '(720) 841-5902', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAIN' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'scottandlisabain@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'GIEBEL', '', '23729 OTOWI ROAD', 'Indian Hills', 'CO', '80454', 'andrew.giebel@gmail.com', '(716) 238-6294', 'RV TYPE= GD IMAGINE 2400 BA', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GIEBEL' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'andrew.giebel@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg & Elaine', 'SPENCE', '', '12661 W. RADCLIFF AVE.', 'Morrison', 'CO', '80465', 'yeeha10@comcast.net', '(303) 973-3198', 'RV TYPE= GD 24''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SPENCE' AND UPPER(first_name) = 'GREG & ELAINE') OR LOWER(email_primary) = 'yeeha10@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rich', 'FARNHAM', '', 'PO BOX 3252', 'Nederland', 'CO', '80466', 'mailboxrichard@yahoo.com', '(303) 579-3775', 'Alt phone: (844) 755-2267', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FARNHAM' AND UPPER(first_name) = 'RICH') OR LOWER(email_primary) = 'mailboxrichard@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim & Jorja', 'KRAUSE', '', '2186 MOUNT EVANS BLVD.', 'Pine', 'CO', '80470', 'timdkrause@mac.com', '(214) 415-2329', 'Alt phone: (214) 236-1929', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KRAUSE' AND UPPER(first_name) = 'TIM & JORJA') OR LOWER(email_primary) = 'timdkrause@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'INGOLDBY', '', '1388 LIONSHEAD RANCH RD.', 'Pine', 'CO', '80470', 'bingoldby@gmail.com', '(720) 454-6175', 'RV TYPE= SPARTAN 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'INGOLDBY' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'bingoldby@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dana', 'HALE', '', '65 HEIDE RD', 'Shawnee', 'CO', '80475', 'dryan882@gmail.com', '(980) 298-5045', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HALE' AND UPPER(first_name) = 'DANA') OR LOWER(email_primary) = 'dryan882@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'BERQUIST', '', 'PO BOX 700', 'Tabernash', 'CO', '80478', 'tabernash97@hotmail.com', '(970) 575-1122', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BERQUIST' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'tabernash97@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'MCBRIDE', '', '779 AMETHYST DR.', 'Steamboat Springs', 'CO', '80487', 'kmcbeeski@msn.com', '(970) 420-1659', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCBRIDE' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kmcbeeski@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'TISCH', '', '1735 NATCHES WAY', 'Steamboat Springs', 'CO', '80487', 'ctisch@yahoo.com', '(970) 846-9726', 'RV TYPE= AS FLYING CLOUD 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TISCH' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'ctisch@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kenneth', 'MARTIN', '', 'PO BOX 24625', 'Silverthorne', 'CO', '80497', 'kmart247@gmail.com', '(713) 203-1849', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTIN' AND UPPER(first_name) = 'KENNETH') OR LOWER(email_primary) = 'kmart247@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'TEOT', '', '525 MARMOT CIRCLE', 'Silverthorne', 'CO', '80498', 'eric.teot@gmail.com', '(970) 471-0467', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TEOT' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'eric.teot@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'CHARRON', '', '349 BALD EAGLE ROAD', 'Silverthorne', 'CO', '80498', 'charronda15@gmail.com', '(678) 882-6554', 'Alt phone: (256) 424-5574', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHARRON' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'charronda15@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Frank', 'SALAZAR', '', 'PO BOX 1772', 'Silverthorne', 'CO', '80498', 'frksalazar@gmail.com', '(970) 409-9233', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SALAZAR' AND UPPER(first_name) = 'FRANK') OR LOWER(email_primary) = 'frksalazar@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andy', 'STALLINGS', '', 'PO BOX 3223', 'Silverthorne', 'CO', '80498', 'andrew.stallings@gmail.com', '(970) 904-6303', 'Alt email: slee3324@gmail.com | Alt phone: (503) 577-2619', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STALLINGS' AND UPPER(first_name) = 'ANDY') OR LOWER(email_primary) = 'andrew.stallings@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dino', 'TAPPER', '', '1799 FALCON DR', 'Silverthorne', 'CO', '80498', 'tapperdino@yahoo.com', '(202) 256-8822', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAPPER' AND UPPER(first_name) = 'DINO') OR LOWER(email_primary) = 'tapperdino@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt& Elizabeth', 'BURGESS', '', '73 WESTERN SKY CIRCLE', 'Longmont', 'CO', '80501', 'burgess.matt@gmail.com', '(919) 355-8672', 'RV TYPE= AS GLOBETROTTER 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BURGESS' AND UPPER(first_name) = 'MATT& ELIZABETH') OR LOWER(email_primary) = 'burgess.matt@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lance', 'CARLSON', '', '1067 S HOVER ST.', 'Longmont', 'CO', '80501', 'lrc.cfam@gmail.com', '(303) 641-3952', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARLSON' AND UPPER(first_name) = 'LANCE') OR LOWER(email_primary) = 'lrc.cfam@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dick', 'PILAND', '', '7205 GOLD NUGGET DR.', 'Niwot', 'CO', '80503', 'rapiland@comcast.net', '(303) 588-0726', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PILAND' AND UPPER(first_name) = 'DICK') OR LOWER(email_primary) = 'rapiland@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'BERANICK', '', '2247 INDIAN PEAKS CIRCLE', 'Longmont', 'CO', '80503', 'john@beranick.com', '(720) 491-8411', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BERANICK' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'john@beranick.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'HUGHEY', '', '1018 WILLOW CT.', 'Longmont', 'CO', '80503', 'robhughey@mac.com', '(303) 304-9441', 'RV TYPE= AS GLOBETROTTER 2023', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUGHEY' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'robhughey@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'MURPHY', '', '9539 N. 89TH ST.', 'Longmont', 'CO', '80503', 'rmurphyb17@gmail.com', '(303) 931-7472', 'RV TYPE= AS 25FB 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURPHY' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'rmurphyb17@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steve', 'PRICE', '', '2241 SPINNAKER CIRCLE', 'Longmont', 'CO', '80503', 'stevepriceloco@gmail.com', '(303) 378-6397', 'RV TYPE= AS 25FB FC 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRICE' AND UPPER(first_name) = 'STEVE') OR LOWER(email_primary) = 'stevepriceloco@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven & Sarah', 'PETERSON', '', '11278 N 66TH ST', 'Longmont', 'CO', '80503', 'stevenjp@icloud.com', '(303) 618-3688', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PETERSON' AND UPPER(first_name) = 'STEVEN & SARAH') OR LOWER(email_primary) = 'stevenjp@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Aric', 'HILMAS', '', '6589 LEGEND RIDGE TRAIL', 'Niwot', 'CO', '80503', 'aric@hilmascpa.com', '(303) 908-0561', 'RV TYPE= SPRINTER DOLPHIN 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HILMAS' AND UPPER(first_name) = 'ARIC') OR LOWER(email_primary) = 'aric@hilmascpa.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'STUBBINGS', '', '8890 PRAIRIE KNOLL DRIVE', 'Longmont', 'CO', '80503', 'bstubbings@gmail.com', '(970) 481-2224', 'RV TYPE= GD IMAGINE 28''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STUBBINGS' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'bstubbings@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tom', 'VILLANI', '', '1561 BELMONT DR.', 'Longmont', 'CO', '80503', 'tdvillani@icloud.com', '(303) 881-8898', 'RV TYPE= AS GLOBETROTTER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VILLANI' AND UPPER(first_name) = 'TOM') OR LOWER(email_primary) = 'tdvillani@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'QUIST', '', '10261 MACEDONIA ST.', 'Longmont', 'CO', '80503', 'redpeak@comcast.net', '(303) 517-9927', 'RV TYPE= JAYCO 154 BH 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'QUIST' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'redpeak@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kensie', 'GEORGE', '', '8998 NIWOT RD', 'Niwot', 'CO', '80503', 'kgeorge@1940sball.org', '(303) 946-9227', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GEORGE' AND UPPER(first_name) = 'KENSIE') OR LOWER(email_primary) = 'kgeorge@1940sball.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rob', 'ROSE', '', '12212 CASH ROAD', 'Longmont', 'CO', '80503', 'wrobrose@gmail.com', '(720) 347-0465', 'RV TYPE= AS 25FB FC 2019  WANTS TO STORE UNTIL APR 2023', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROSE' AND UPPER(first_name) = 'ROB') OR LOWER(email_primary) = 'wrobrose@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Matt', 'BREWER', '', '2112 ANDREW ALDEN ST.', 'Longmont', 'CO', '80504', 'mbrewer37@gmail.com', '(303) 717-9446', 'RV TYPE= AS INTERNATIONAL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BREWER' AND UPPER(first_name) = 'MATT') OR LOWER(email_primary) = 'mbrewer37@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James & Linda', 'SHISLER', '', '11771 PLEASANT VIEW RIDGE', 'Longmont', 'CO', '80504', 'linda.shisler@gmail.com', '(720) 937-5432', 'RV TYPE= AS BAMBI 2021.  WILL SCHEDULE OCT 12TH | Alt email: jshis101@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHISLER' AND UPPER(first_name) = 'JAMES & LINDA') OR LOWER(email_primary) = 'linda.shisler@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jane & Paul', 'SUWALSKI', '', '1801 ASHFORD CIRCLE', 'Longmont', 'CO', '80504', 'pjdunsuw@gmail.com', '(303) 651-0209', 'RV TYPE= AS 25FB 2021 | Alt phone: (720) 841-3318', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SUWALSKI' AND UPPER(first_name) = 'JANE & PAUL') OR LOWER(email_primary) = 'pjdunsuw@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cynthia', 'ESPESETH', '', '464 WAGON BEND ROAD', 'Berthoud', 'CO', '80513', 'cynthia.espeseth@gmail.com', '(425) 894-0552', 'RV TYPE= AS CARAVEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ESPESETH' AND UPPER(first_name) = 'CYNTHIA') OR LOWER(email_primary) = 'cynthia.espeseth@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dean & Verna', 'COVEY', '', '319 BIMSON AVE.', 'Berthoud', 'CO', '80513', '', '(970) 817-4496', 'RV TYPE= GD REFLECTION 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COVEY' AND UPPER(first_name) = 'DEAN & VERNA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bernie', 'HUND', '', '2102 SHORESIDE DRIVE', 'Berthoud', 'CO', '80513', 'bernie.hund@gmail.com', '(719) 251-9857', 'RV TYPE= TIFFIN ALLEGRO BAY 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUND' AND UPPER(first_name) = 'BERNIE') OR LOWER(email_primary) = 'bernie.hund@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill/Bonnie', 'RAMTHUN', '', '806 POPE DR.', 'Erie', 'CO', '80516', 'bonnie@bonnieramthun.com', '(303) 638-0095', 'RV TYPE= COLEMAN LANTERN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RAMTHUN' AND UPPER(first_name) = 'BILL/BONNIE') OR LOWER(email_primary) = 'bonnie@bonnieramthun.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Byron', 'GOSWICK', '', '150 BEECH COURT', 'Erie', 'CO', '80516', 'bgosw@comcast.net', '(303) 204-3638', 'RV TYPE= COUNTRY COACH 2003 36''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GOSWICK' AND UPPER(first_name) = 'BYRON') OR LOWER(email_primary) = 'bgosw@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'WILLIAMS', '', '2551 WHARTON CT', 'Erie', 'CO', '80516', 'rumtot@juno.com', '(303) 641-0959', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'rumtot@juno.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sarah', 'KUIKEN', '', '2383 PONDEROSA PLACE', 'Erie', 'CO', '80516', 'skuiken@gmail.com', '(303) 884-0592', 'RV TYPE= GD IMAGINE 33''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUIKEN' AND UPPER(first_name) = 'SARAH') OR LOWER(email_primary) = 'skuiken@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bruce', 'KELSO', '', '358 MEADOW VIEW PKWY', 'Erie', 'CO', '80516', 'bskelso@yahoo.com', '(303) 815-9560', 'RV TYPE= AS INTERSTATE SIGNATURE 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KELSO' AND UPPER(first_name) = 'BRUCE') OR LOWER(email_primary) = 'bskelso@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerry', 'MADRID', '', '6305 SPRING GULCH ST', 'Frederick', 'CO', '80516', 'gemmadrid@msn.com', '(303) 807-9185', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MADRID' AND UPPER(first_name) = 'JERRY') OR LOWER(email_primary) = 'gemmadrid@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'WEST', '', '1463 HICKORY DR.', 'Erie', 'CO', '80516', 'somewest@gmail.com', '(303) 775-8025', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WEST' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'somewest@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bryan', 'MAU', '', '1434 HICKORY DR.', 'Erie', 'CO', '80516', 'bryanmau93@gmail.com', '(863) 701-6778', 'RV TYPE= KEYSTONE MOUNTAINEER 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MAU' AND UPPER(first_name) = 'BRYAN') OR LOWER(email_primary) = 'bryanmau93@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeff', 'BARBOUR', '', '1837 RUE DE TRUST', 'Erie', 'CO', '80516', 'jsbarbour81@gmail.com', '(303) 718-6877', 'RV TYPE= GD IMAGINE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARBOUR' AND UPPER(first_name) = 'JEFF') OR LOWER(email_primary) = 'jsbarbour81@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'ZITTERKOPF', '', '6511 EMPIRE AVE.', 'Frederick', 'CO', '80516', 'jameszitterkopf@gmail.com', '(720) 701-1888', 'RV TYPE= FR R-POD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZITTERKOPF' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'jameszitterkopf@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'ZUPAN', '', '716 POPE DR.', 'Erie', 'CO', '80516', 'napuzk@gmail.com', '(720) 840-4896', 'RV TYPE= KZ SPREE 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZUPAN' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'napuzk@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerry', 'KUIKEN', '', '2383 PONDEROSA PLACE    ERIE, CO', 'Erie', 'CO', '80516', 'jkuiken@comcast.net', '(303) 775-4565', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KUIKEN' AND UPPER(first_name) = 'JERRY') OR LOWER(email_primary) = 'jkuiken@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'ZUPAN', '', '716 POPE DR.', 'Erie', 'CO', '80516', 'napuzk@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ZUPAN' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'napuzk@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry & Beverly', 'GRANRUD', '', '1163 LIMESTONE DR.', 'Erie', 'CO', '80516', 'larry.granrud@gmail.com', '(303) 242-7199', 'Alt phone: (303) 921-8593', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRANRUD' AND UPPER(first_name) = 'LARRY & BEVERLY') OR LOWER(email_primary) = 'larry.granrud@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nikki - Alana', 'TENA - SHERMAN', '', '1632 N. FRANKLIN ST', 'Fort Collins', 'CO', '80521', 'nikkitena1@gmail.com', '(971) 865-6653', 'Alt email: alanaissherman@gmail.com | Alt phone: (760) 917-7697', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TENA - SHERMAN' AND UPPER(first_name) = 'NIKKI - ALANA') OR LOWER(email_primary) = 'nikkitena1@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven', 'HUGHES', '', '751 SNOWY PLAIN ROAD', 'Ft. Collins', 'CO', '80525', 'steven.a.hughespe@gmail.com', '(601) 529-6262', 'RV TYPE= AS FLYING CLOUD 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUGHES' AND UPPER(first_name) = 'STEVEN') OR LOWER(email_primary) = 'steven.a.hughespe@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jack', 'MEYER', '', '3207 ALUMBAUGH CT', 'Ft. Collins', 'CO', '80526', 'jack@jackmeyer.net', '(970) 218-4293', 'RV TYPE= AS CLASSIC 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MEYER' AND UPPER(first_name) = 'JACK') OR LOWER(email_primary) = 'jack@jackmeyer.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'EISEMANN', '', '2161 ROMNEY AVE', 'Fort Collins', 'CO', '80526', 'johneisemann@yahoo.com', '(970) 988-9325', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EISEMANN' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'johneisemann@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Eric', 'JENKINS', '', '4832 PRAIRE VISTA DR.', 'Ft. Collins', 'CO', '80526', 'jenkins.ch@gmail.com', '(970) 215-9069', 'RV TYPE= AS BASECAMP 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JENKINS' AND UPPER(first_name) = 'ERIC') OR LOWER(email_primary) = 'jenkins.ch@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Murph', 'MCIVER', '', '5603 Falling Water Dr.', 'Fort Collins', 'CO', '80528', 'mm@xeosoftware.com', '(210) 549-8559', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCIVER' AND UPPER(first_name) = 'MURPH') OR LOWER(email_primary) = 'mm@xeosoftware.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Katrina', 'KASTENDIECK', '', '5945 ESPALIER LANE', 'Fort Collins', 'CO', '80528', 'klkastendieck@gmail.com', '(804) 519-7209', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KASTENDIECK' AND UPPER(first_name) = 'KATRINA') OR LOWER(email_primary) = 'klkastendieck@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'KIMAK', '', '508 MESA DRIVE', 'Loveland', 'CO', '80537', 'xfish9@gmail.com', '(970) 412-1940', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KIMAK' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'xfish9@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mj', 'WYLIE', '', '621 E. 11TH', 'Loveland', 'CO', '80537', 'airstream14256@gmail.com', '(303) 961-7050', 'RV TYPE= AS FLYING CLOUD | Alt email: mjwylieincolorado@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WYLIE' AND UPPER(first_name) = 'MJ') OR LOWER(email_primary) = 'airstream14256@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'GARBER', '', '1502 CAPLIN DR.', 'Loveland', 'CO', '80538', 'garberda@comcast.net', '(970) 744-1698', 'RV TYPE= AS FLYING CLOUD', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARBER' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'garberda@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'RANDOLPH', '', '312 1ST ST.', 'Severance', 'CO', '80546', 'mark@tapestryhouse.com', '(970) 420-6912', 'RV TYPE= AS CLASSIC LTD. 2007', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RANDOLPH' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'mark@tapestryhouse.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Julie & Kevin', 'LARKIN', '', '1201 MCGREGOR CIRCLE', 'Erie', 'CO', '80596', 'julie@klarkin.net', '(312) 493-6144', 'RV TYPE= OUTDOORS RV 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LARKIN' AND UPPER(first_name) = 'JULIE & KEVIN') OR LOWER(email_primary) = 'julie@klarkin.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Attn: Lyle', 'SHOCO OIL', '', '725 S. MAIN ST.', 'Brighton', 'CO', '80601', 'sthompson@shocooil.com', '(303) 659-5610', 'Alt email: dhackett@shocooil.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHOCO OIL' AND UPPER(first_name) = 'ATTN: LYLE') OR LOWER(email_primary) = 'sthompson@shocooil.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'David', 'ROBBINS', '', '94 MILLER AVE. APT 106', 'Brighton', 'CO', '80601', 'dave-42@hotmail.com', '(303) 882-7366', 'RV TYPE= K2 SPORTMAN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROBBINS' AND UPPER(first_name) = 'DAVID') OR LOWER(email_primary) = 'dave-42@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Marek & Chelsea', 'ROMANOWSKI', '', '503 TWINING AVE.', 'Brighton', 'CO', '80601', 'romanowski24@gmail.com', '(303) 589-4247', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROMANOWSKI' AND UPPER(first_name) = 'MAREK & CHELSEA') OR LOWER(email_primary) = 'romanowski24@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Valarie', 'COFFMAN', '', '5872 WHEATBERRY DR.', 'Brighton', 'CO', '80601', 'valariecoffman@gmail.com', '(720) 229-7915', 'RV TYPE= FR CHEROKEE 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'COFFMAN' AND UPPER(first_name) = 'VALARIE') OR LOWER(email_primary) = 'valariecoffman@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Arthur/Rebecca', 'ANDERSEN', '', '719 LARKSPUR CT.', 'Brighton', 'CO', '80601', 'becky.heredia@hotmail.com', '(303) 883-6739', 'RV TYPE= FR HERITAGE TT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ANDERSEN' AND UPPER(first_name) = 'ARTHUR/REBECCA') OR LOWER(email_primary) = 'becky.heredia@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Misty', 'HYNES', '', '4397 CRESTONE PEAK ST.', 'Brighton', 'CO', '80601', 'mistyhynes@gmail.com', '(571) 364-9539', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HYNES' AND UPPER(first_name) = 'MISTY') OR LOWER(email_primary) = 'mistyhynes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joey', 'MORA', '', '4602 MT. SHAUNNO ST.', 'Brighton', 'CO', '80601', 'joeymora58@msn.com', '(303) 557-8019', 'RV TYPE= CHEYENNE POPUP 2004', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORA' AND UPPER(first_name) = 'JOEY') OR LOWER(email_primary) = 'joeymora58@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dustin', 'SANDER', '', '3459 HOTTMAN ST.', 'Brighton', 'CO', '80601', 'dustinsander@gmail.com', '(303) 817-9832', 'RV TYPE= VIKING 17'' 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDER' AND UPPER(first_name) = 'DUSTIN') OR LOWER(email_primary) = 'dustinsander@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'SANDERS', '', '5241 KILLDEER ST.', 'Brighton', 'CO', '80601', 'ttsanders@comcast.net', '(720) 684-9527', 'RV TYPE= PRIMETIME AVENGER 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDERS' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'ttsanders@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Valerie', 'WHITE', '', '4545 OXBOW DR.', 'Brighton', 'CO', '80601', 'valwhite@pacbell.net', '(925) 980-1182', 'RV TYPE= STARCRAFT 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITE' AND UPPER(first_name) = 'VALERIE') OR LOWER(email_primary) = 'valwhite@pacbell.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'MCCLENDON', '', '695 N. 14TH AVE.', 'Brighton', 'CO', '80601', 'pmac2213@yahoo.com', '(303) 517-2326', 'RV TYPE= DUTCHMAN RUBICON 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCLENDON' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'pmac2213@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Fleischacker', 'KURK', '', '4930 MT. CAMERON DR.', 'Brighton', 'CO', '80601', 'kurkfleeischacker@gmail.com', '(720) 548-8519', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KURK' AND UPPER(first_name) = 'FLEISCHACKER') OR LOWER(email_primary) = 'kurkfleeischacker@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'CIMILUCA', '', '4737 MT. SHAVANO ST.', 'Brighton', 'CO', '80601', 'jimcimiluca@gmail.com', '(720) 323-6784', 'RV TYPE= GD IMAGINE 2400 BH', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CIMILUCA' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jimcimiluca@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dion', 'EADS', '', '5733 LONGS PEAK ST.', 'Brighton', 'CO', '80601', 'dion.eads@hotmail.com', '(303) 332-3150', 'RV TYPE= HEARTLAND PIONEER 26''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EADS' AND UPPER(first_name) = 'DION') OR LOWER(email_primary) = 'dion.eads@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joey', 'ARP', '', '583 S. 15TH DR.', 'Brighton', 'CO', '80601', 'arp.joey43@gmail.com', '(303) 669-7950', 'RV TYPE= GD IMAGINE 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARP' AND UPPER(first_name) = 'JOEY') OR LOWER(email_primary) = 'arp.joey43@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Roxie', 'WURTSBAUGH', '', '14550 BRIGHTON ROAD', 'Brighton', 'CO', '80601', 'momre@yahoo.com', '(720) 496-9081', 'RV TYPE= KEYSTONE MONTANA 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WURTSBAUGH' AND UPPER(first_name) = 'ROXIE') OR LOWER(email_primary) = 'momre@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Stephanie', 'VILLEGAS', '', '1468 CHERYWOOD DR', 'Brighton', 'CO', '80601', 'svillegas929@gmail.com', '(303) 332-8414', 'RV TYPE= GD REFLECTION 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VILLEGAS' AND UPPER(first_name) = 'STEPHANIE') OR LOWER(email_primary) = 'svillegas929@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gordon', 'PERRY', '', '313 ZUNIGA ST.', 'Brighton', 'CO', '80601', 'gperry@tristategt.org', '(303) 229-3310', 'RV TYPE= SPORTSCOACH CLASS A 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PERRY' AND UPPER(first_name) = 'GORDON') OR LOWER(email_primary) = 'gperry@tristategt.org');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kimberly', 'PINNEY', '', '2560 CHERRY CIRCLE', 'Brighton', 'CO', '80601', 'kp26003@ymail.com', '(303) 842-1334', 'RV TYPE= ATTITUDE 18''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PINNEY' AND UPPER(first_name) = 'KIMBERLY') OR LOWER(email_primary) = 'kp26003@ymail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'LARSEN', '', '2439 GROVE PLACE', 'Brighton', 'CO', '80601', 'larsenblake@hotmail.com', '(720) 470-9548', 'RV TYPE= LANCE 28''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LARSEN' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'larsenblake@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'PAIVA', '', '307 S 24TH AVE.', 'Brighton', 'CO', '80601', '', '(970) 415-1034', 'RV TYPE= WINNEBAGO CHALET 24U', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PAIVA' AND UPPER(first_name) = 'ROBERT'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'T.C.', 'OXLEY', '', '10800 E. 124TH AVE.', 'Brighton', 'CO', '80601', 'tco@dspbuilders.com', '(303) 829-7203', 'RV TYPE= JAYCO NORTHPOINT 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'OXLEY' AND UPPER(first_name) = 'T.C.') OR LOWER(email_primary) = 'tco@dspbuilders.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'ELLIOTT', '', '3060 E. BRIDGE ST.LOT 32', 'Brighton', 'CO', '80601', 'billelliott1969@msn.com', '(704) 476-6819', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ELLIOTT' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'billelliott1969@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Becky', 'HOHNSTEIN', '', '725 S. MAIN ST.', 'Brighton', 'CO', '80601', '', '(720) 350-8079', 'RV TYPE= ACS UTILITY TRAILER 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOHNSTEIN' AND UPPER(first_name) = 'BECKY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'ARMSTRONG', '', '1716 EMMA LANE', 'Brighton', 'CO', '80601', 'armstrongryanp@gmail.com', '(303) 500-2360', 'RV TYPE= COUGAR 2012', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARMSTRONG' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'armstrongryanp@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tim', 'TRIM', '', '701 S. 34TH AVE.', 'Brighton', 'CO', '80601', 'timtrim@esrta.com', '(970) 554-0006', 'RV TYPE= LANCE TT 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TRIM' AND UPPER(first_name) = 'TIM') OR LOWER(email_primary) = 'timtrim@esrta.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Anna', 'KELLY', '', '15493 IOLA ST', 'Brighton', 'CO', '80602', 'amkelly_2005@yahoo.com', '(303) 815-4750', 'RV TYPE= AS CARAVEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KELLY' AND UPPER(first_name) = 'ANNA') OR LOWER(email_primary) = 'amkelly_2005@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jayson', 'SNORTLAND', '', '7926 E. 125TH AVE.', 'Thornton', 'CO', '80602', 'jaysnortland@yahoo.com', '(720) 375-1818', 'RV TYPE= KODIAK ULTRA LITE 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SNORTLAND' AND UPPER(first_name) = 'JAYSON') OR LOWER(email_primary) = 'jaysnortland@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dale', 'LISTER', '', '12460 UINTA ST.', 'Thornton', 'CO', '80602', 'dlister620@gmail.com', '(303) 547-8531', 'RV TYPE= HEARTLAND ROAD WARRIOR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LISTER' AND UPPER(first_name) = 'DALE') OR LOWER(email_primary) = 'dlister620@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rob', 'CLUGSTON', '', '2309 E 145TH CT', 'Thornton', 'CO', '80602', 'clugs303@gmail.com', '(303) 725-8394', 'RV TYPE= MONACO DIPLOMAT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CLUGSTON' AND UPPER(first_name) = 'ROB') OR LOWER(email_primary) = 'clugs303@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cj', 'SHAW', '', '5835 E 124TH PLACE', 'Brighton', 'CO', '80602', 'cjshaw.com@gmail.com', '(720) 854-4352', 'RV TYPE= THOR 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHAW' AND UPPER(first_name) = 'CJ') OR LOWER(email_primary) = 'cjshaw.com@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Steven', 'WILLIAMS', '', '6270 E. 122ND DR.', 'Brighton', 'CO', '80602', 'wengineeroso@aol.com', '(720) 252-8711', 'RV TYPE= FR VCROSS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILLIAMS' AND UPPER(first_name) = 'STEVEN') OR LOWER(email_primary) = 'wengineeroso@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'MARCEAU', '', '12836 VINE ST.', 'Thornton', 'CO', '80602', 'bfaul03@msn.com', '(303) 917-8950', 'RV TYPE= STARWOOD 5TH WHEEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARCEAU' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'bfaul03@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kirk', 'LINKEVICH', '', '6801 EAGLE SHADOW AVE.', 'Brighton', 'CO', '80602', 'tymeslayer@msn.com', '(720) 838-4853', 'RV TYPE= ATLAS 2018 &COACHMAN TT 35''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINKEVICH' AND UPPER(first_name) = 'KIRK') OR LOWER(email_primary) = 'tymeslayer@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Paul', 'TAYLOR', '', '5298 E. 144TH PLACE', 'Thornton', 'CO', '80602', 'paulscotttaylor2@gmail.com', '(720) 341-2843', 'RV TYPE= BAYSIDE POP UP 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TAYLOR' AND UPPER(first_name) = 'PAUL') OR LOWER(email_primary) = 'paulscotttaylor2@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Sandie', 'FERNQUIST', '', '6260 E 122ND DR.', 'Brighton', 'CO', '80602', 'fernquistbillsan@q.com', '(720) 810-2342', 'RV TYPE= LANCE 2465', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FERNQUIST' AND UPPER(first_name) = 'SANDIE') OR LOWER(email_primary) = 'fernquistbillsan@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tobias', 'WAGNER', '', '8714 E. 162ND AVE.', 'Brighton', 'CO', '80602', 'tobyagain@comcast.net', '(303) 204-6209', 'RV TYPE= TRAILS WEST ST 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WAGNER' AND UPPER(first_name) = 'TOBIAS') OR LOWER(email_primary) = 'tobyagain@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Justin/Amanda', 'WELCH', '', '13812 LOCUST ST.', 'Thornton', 'CO', '80602', 'welch2603@msn.com', '(720) 985-5723', 'RV TYPE= TRAIL CRUISER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WELCH' AND UPPER(first_name) = 'JUSTIN/AMANDA') OR LOWER(email_primary) = 'welch2603@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'HOLT', '', '12744 LEYDEN ST', 'Brighton', 'CO', '80602', 'kevinkholt@msn.com', '(303) 946-2269', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOLT' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kevinkholt@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Greg & Maureen', 'STOKES', '', '15575 WILLOW ST', 'Thornton', 'CO', '80602', 'jgregstokes@gmail.com', '(303) 918-1003', 'RV TYPE= WINNE EVA 23''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STOKES' AND UPPER(first_name) = 'GREG & MAUREEN') OR LOWER(email_primary) = 'jgregstokes@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'EVENSON', '', '7770 E. 148TH DR.', 'Thornton', 'CO', '80602', 'mkevenson16@gmail.com', '(707) 495-4559', 'RV TYPE= RETRO RIVERSIDE 179SE 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EVENSON' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'mkevenson16@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cc', 'CONCRETE', '', '10105 E. 149TH CT.', 'Brighton', 'CO', '80602', 'ccconcrete84@gmail.com', '(720) 296-1382', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CONCRETE' AND UPPER(first_name) = 'CC') OR LOWER(email_primary) = 'ccconcrete84@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ryan', 'MADDEN', '', '13638 DEXTER ST.', 'Thornton', 'CO', '80602', 'rmadden4280@gmail.com', '(720) 445-2386', 'RV TYPE= SUNSET TRAIL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MADDEN' AND UPPER(first_name) = 'RYAN') OR LOWER(email_primary) = 'rmadden4280@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michelle And Jarrod', 'BAYLESS', '', '1619 E. 167TH CIRCLE', 'Thornton', 'CO', '80602', 'baylesstrucking@gmail.com', '(720) 205-4069', 'RV TYPE= DUTCHMAN 4 WINDS 29''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BAYLESS' AND UPPER(first_name) = 'MICHELLE AND JARROD') OR LOWER(email_primary) = 'baylesstrucking@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gene', 'ROHR', '', '13088 MONACO WAY', 'Thornton', 'CO', '80602', '', '(303) 808-7389', 'RV TYPE= JAYCO EAGLE 5TH WHEEL 28''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ROHR' AND UPPER(first_name) = 'GENE'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'VIGIL', '', '13702 DEXTER WAY', 'Brighton', 'CO', '80602', 'mike.j.vigil@gmail.com', '(303) 888-6306', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VIGIL' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mike.j.vigil@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'DOERING', '', '15369 ROSLYN ST.', 'Thornton', 'CO', '80602', 'jim.doering52@gmail.com', '(208) 866-8723', '4100400025224190  EXP 04/26  JAMES DOERING  622  ZIP 80602  hitch due in on 3/14/23', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DOERING' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'jim.doering52@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'RICHTER', '', '1515 E. 143RD AVE.', 'Brighton', 'CO', '80602', 'medtechmark@msn.com', '(303) 378-1254', 'RV TYPE= ROCKWOOD 2710 2010', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RICHTER' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'medtechmark@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ken & Sally', 'NAVE', '', '8940 E 155TH AVE.', 'Brighton', 'CO', '80602', 'kensal81@gmail.com', '(303) 622-9363', 'RV TYPE= GD SOLITUDE 310GK', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'NAVE' AND UPPER(first_name) = 'KEN & SALLY') OR LOWER(email_primary) = 'kensal81@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Danny', 'CHAMBERLAIN', '', '13849 LILAC ST', 'Thornton', 'CO', '80602', 'chv2506@aol.com', '(720) 341-6893', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHAMBERLAIN' AND UPPER(first_name) = 'DANNY') OR LOWER(email_primary) = 'chv2506@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Fred', 'REITER', '', '16153 KRAMERIA COURT', 'Brighton', 'CO', '80602', 'imagecreations5@aol.com', '(303) 810-2984', 'RV TYPE= JAYCO SENECA 38''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'REITER' AND UPPER(first_name) = 'FRED') OR LOWER(email_primary) = 'imagecreations5@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bryan', 'ALSTON', '', '10100 E. 145TH AVE.', 'Thornton', 'CO', '80602', 'flybryan@msn.com', '(303) 204-8162', 'RV TYPE= THOR CHATEAU 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ALSTON' AND UPPER(first_name) = 'BRYAN') OR LOWER(email_primary) = 'flybryan@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Geff', 'HOFFMAN', '', '15341 HERITAGE CIRCLE', 'Thornton', 'CO', '80602', 'bikeby2@me.com', '(303) 908-4821', 'RV TYPE= PLEASUREWAY', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HOFFMAN' AND UPPER(first_name) = 'GEFF') OR LOWER(email_primary) = 'bikeby2@me.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'RANGEL', '', '12350 LOCUST ST.', 'Brighton', 'CO', '80602', 'mrangel8308@gmail.com', '(303) 817-6603', 'RV TYPE= PIONEER 2020 21''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RANGEL' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mrangel8308@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jeb', 'PARK', '', '13781 SPRUCE ST', 'Thornton', 'CO', '80602', 'jeb_park@hotmail.com', '(303) 947-1263', 'RV TYPE= COLEMAN LANTERN 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PARK' AND UPPER(first_name) = 'JEB') OR LOWER(email_primary) = 'jeb_park@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Scott', 'HICKMAN', '', '13452 KEARNEY ST.', 'Thornton', 'CO', '80602', 'hickman_s@hotmail.com', '(303) 995-1966', 'RV TYPE= GD IMAGINE 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HICKMAN' AND UPPER(first_name) = 'SCOTT') OR LOWER(email_primary) = 'hickman_s@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Adam & Bethany', 'AGER', '', '10625 E. 157TH COURT', 'Brighton', 'CO', '80602', 'theagers@hotmail.com', '(720) 936-2414', 'RV TYPE= KZ ESCAPE 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'AGER' AND UPPER(first_name) = 'ADAM & BETHANY') OR LOWER(email_primary) = 'theagers@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'John', 'GROSS', '', '2179 E. 149TH AVE.', 'Thornton', 'CO', '80602', 'johnggrossii@comcast.net', '(952) 237-9801', 'RV TYPE= BIGHORN 2013', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GROSS' AND UPPER(first_name) = 'JOHN') OR LOWER(email_primary) = 'johnggrossii@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'BEDDO', '', '6099 EAST 163RD AVE', 'Brighton', 'CO', '80602', 'mbeddo@aol.com', '(303) 619-1797', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BEDDO' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mbeddo@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zachary/Nicolette', 'KAMERZELL', '', '12733 LEYDEN ST. UNIT E', 'Thornton', 'CO', '80602', 'zmancbr9@yahoo.com', '(970) 690-4845', 'RV TYPE= HEARTLAND MALLARD M185', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KAMERZELL' AND UPPER(first_name) = 'ZACHARY/NICOLETTE') OR LOWER(email_primary) = 'zmancbr9@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Keith', 'WINES', '', '8191 E. 132ND AVE.', 'Thornton', 'CO', '80602', 'keith.wines@outlook.com', '(303) 960-2334', 'RV TYPE= FLAGSTAFF', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WINES' AND UPPER(first_name) = 'KEITH') OR LOWER(email_primary) = 'keith.wines@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'WOLINSKI', '', '8846 E. 152ND PLACE', 'Thornton', 'CO', '80602', 'wolinski@comcast.net', '(510) 461-7647', 'RV TYPE= AS 22SPORT | Alt phone: (510) 862-2898', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOLINSKI' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'wolinski@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'DANIS', '', '13364 ONEIDA ST.', 'Thornton', 'CO', '80602', 'gpdanis@comcast.net', '(203) 214-3345', 'RV TYPE= GEOPRO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DANIS' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'gpdanis@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Geoff', 'MILLS', '', '15803 ELIZABETH CIRCLE W', 'Thornton', 'CO', '80602', 'millsg78@gmail.com', '(303) 241-2709', 'RV TYPE= KEYSTONE 259 2004', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MILLS' AND UPPER(first_name) = 'GEOFF') OR LOWER(email_primary) = 'millsg78@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron/Joanna', 'SCHOTT', '', '4591 E. 137TH PLACE', 'Thornton', 'CO', '80602', 'ronschott@comcast.net', '(303) 452-4837', 'RV TYPE= JAYCO', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHOTT' AND UPPER(first_name) = 'RON/JOANNA') OR LOWER(email_primary) = 'ronschott@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'James', 'SCHAFER', '', '13895 GLENCOE ST.', 'Thornton', 'CO', '80602', 'meleanie@msn.com', '(303) 880-2627', 'RV TYPE= SUN VALLEY TT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHAFER' AND UPPER(first_name) = 'JAMES') OR LOWER(email_primary) = 'meleanie@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Don', 'CHESHEK', '', '6995 E. 133RD AVE.', 'Thornton', 'CO', '80602', 'happiness827@comcast.net', '(303) 815-9534', 'RV TYPE= ALPINE 5TH WHEEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CHESHEK' AND UPPER(first_name) = 'DON') OR LOWER(email_primary) = 'happiness827@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tyler', 'MITCHELL', '', '13906 IVY ST', 'Thornton', 'CO', '80602', 'tylermitchellrn@gmail.com', '(720) 289-5310', 'RV TYPE= FR ROCKWOOD ROO 2011', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MITCHELL' AND UPPER(first_name) = 'TYLER') OR LOWER(email_primary) = 'tylermitchellrn@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Tyler', 'MOORE', '', '6944 E. 133RD PLACE', 'Thornton', 'CO', '80602', 'moore.tyler.r@gmail.com', '(303) 726-4742', 'RV TYPE= BLACK SERIES', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MOORE' AND UPPER(first_name) = 'TYLER') OR LOWER(email_primary) = 'moore.tyler.r@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kenneth', 'LINGAFELTER', '', '32801 E. 137TH WAY', 'Brighton', 'CO', '80603', '', '(720) 363-6775', 'RV TYPE= KEYSTONE PASSPORT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LINGAFELTER' AND UPPER(first_name) = 'KENNETH'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maggie', 'HUNTLEY', '', '24707 E.153RD CIRCLE', 'Brighton', 'CO', '80603', 'mlhjah06@comcast.net', '(303) 349-6222', 'GEICO SUBMITTED TO LIPPERT TO GET THE AWNING FABRIC REPLACED.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUNTLEY' AND UPPER(first_name) = 'MAGGIE') OR LOWER(email_primary) = 'mlhjah06@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Daniel', 'LATZER', '', '15621 DUQUESNE CIRCLE', 'Brighton', 'CO', '80603', 'd_latzer@yahoo.com', '(303) 522-2676', 'RV TYPE= R-POD 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LATZER' AND UPPER(first_name) = 'DANIEL') OR LOWER(email_primary) = 'd_latzer@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'George', 'FIELDS', '', '28400 E 160TH AVE.', 'Brighton', 'CO', '80603', 'ajmfields@yahoo.com', '(303) 210-1646', 'RV TYPE= ALLEGRO BAY 2008', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FIELDS' AND UPPER(first_name) = 'GEORGE') OR LOWER(email_primary) = 'ajmfields@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry', 'FAUT', '', '160113 E. 124TH AVE.', 'Brighton', 'CO', '80603', 'grriz1@comcast.net', '(303) 981-3329', 'RV TYPE= ATC HAULER', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FAUT' AND UPPER(first_name) = 'LARRY') OR LOWER(email_primary) = 'grriz1@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Terri/Jerry', 'JACKINTELL', '', '24707 E. 153RD CIRCLE', 'Brighton', 'CO', '80603', 'jtjackarf@gmail.com', '(303) 941-0910', 'RV TYPE= GD SOLITUDE 5TH WHEEL 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JACKINTELL' AND UPPER(first_name) = 'TERRI/JERRY') OR LOWER(email_primary) = 'jtjackarf@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'KODRA', '', '1870 RUBY COURT', 'Lochbuie', 'CO', '80603', 'kyle.kodra@gmail.com', '(303) 827-4043', 'RV TYPE= FR PUMA 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KODRA' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'kyle.kodra@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jim', 'BOUTWELL', '', '12289 IDALIA PLACE', 'Commerce City', 'CO', '80603', 'bout6872@yahoo.com', '(720) 234-5094', 'RV TYPE=  FLAGSTAFF SHAMROCK', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOUTWELL' AND UPPER(first_name) = 'JIM') OR LOWER(email_primary) = 'bout6872@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jo', 'CRICKENBERGER', '', '32750 140TH WAY', 'Brighton', 'CO', '80603', 'agilejo@hotmail.com', '(303) 927-9913', 'RV TYPE= FR CLASS B', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CRICKENBERGER' AND UPPER(first_name) = 'JO') OR LOWER(email_primary) = 'agilejo@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Pedro', 'PAYAN', '', '15121 SHADOW WOOD ST', 'Brighton', 'CO', '80603', 'payanp@hotmail.com', '(303) 919-6834', 'RV TYPE= KEYSTONE COUGAR 2012', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PAYAN' AND UPPER(first_name) = 'PEDRO') OR LOWER(email_primary) = 'payanp@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Frank', 'DUTTON', '', '427 SILO CT', 'Brighton', 'CO', '80603', 'frankdutton11@gmail.com', '(303) 905-1791', 'RV TYPE= JAYCO 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DUTTON' AND UPPER(first_name) = 'FRANK') OR LOWER(email_primary) = 'frankdutton11@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'DURAN', '', '4763 CARMICHAEL CT', 'Brighton', 'CO', '80603', 'mike@enduranceroofing.net', '(720) 431-6744', 'RV TYPE= TRAIL LITE 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DURAN' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mike@enduranceroofing.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jaime', 'SANDOVAL', '', '15011 SHADOW WOOD ST.', 'Brighton', 'CO', '80603', 'jjbsandoval@yahoo.com', '(303) 944-8900', 'RV TYPE= KEYSTONE AVALANCHE 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SANDOVAL' AND UPPER(first_name) = 'JAIME') OR LOWER(email_primary) = 'jjbsandoval@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nicole', 'TRAHAN', '', '18198 SAGEBRUSH WAY', 'Brighton', 'CO', '80603', 'mommyothree@icloud.com', '(970) 630-8419', 'RV TYPE= GD SOLITUDE 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'TRAHAN' AND UPPER(first_name) = 'NICOLE') OR LOWER(email_primary) = 'mommyothree@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kirk', 'WILSON', '', '32725 E. 140TH WAY', 'Brighton', 'CO', '80603', 'kwilson49er@gmail.com', '(303) 909-5925', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILSON' AND UPPER(first_name) = 'KIRK') OR LOWER(email_primary) = 'kwilson49er@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jerry', 'WHITE', '', '4545 OXBOW DR.', 'Brighton', 'CO', '80605', 'whitefix@aol.com', '(925) 980-6679', 'RV TYPE= STARCRAFT 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WHITE' AND UPPER(first_name) = 'JERRY') OR LOWER(email_primary) = 'whitefix@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Blake', 'BRANSCUM', '', '', 'Brighton', 'CO', '80612', 'blakebranscum@hotmail.com', '(970) 310-5603', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRANSCUM' AND UPPER(first_name) = 'BLAKE') OR LOWER(email_primary) = 'blakebranscum@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'PRICE', '', '880 FALCON RIDGE CT.', 'Eaton', 'CO', '80615', 'robpricecpa@aol.com', '(970) 590-0845', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PRICE' AND UPPER(first_name) = 'ROBERT') OR LOWER(email_primary) = 'robpricecpa@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben & Linda', 'HANSFORD', '', '15251 CASLER AVE.', 'Ft. Lupton', 'CO', '80621', 'bensr1@q.com', '(303) 857-1134', 'RV TYPE= FR COLUMBUS COMPASS', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANSFORD' AND UPPER(first_name) = 'BEN & LINDA') OR LOWER(email_primary) = 'bensr1@q.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cari', 'MICALA', '', '15812 MORRIS AVE.', 'Fort Lupton', 'CO', '80621', 'carimicala@hotmail.com', '(720) 606-3647', 'RV TYPE= CASCADE 21 TT 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MICALA' AND UPPER(first_name) = 'CARI') OR LOWER(email_primary) = 'carimicala@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jason', 'FUNK', '', '4883 COUNTY ROAD 37', 'Fort Lupton', 'CO', '80621', 'jasonfunk24@gmail.com', '(303) 434-2804', 'RV TYPE= GD MOMENTUM 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FUNK' AND UPPER(first_name) = 'JASON') OR LOWER(email_primary) = 'jasonfunk24@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ann', 'IRSIK', '', '5951 CR 41', 'Ft. Lupton', 'CO', '80621', 'annmcentire52@yahoo.com', '(720) 233-0256', 'RV TYPE= KEYSTONE COUGAR', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'IRSIK' AND UPPER(first_name) = 'ANN') OR LOWER(email_primary) = 'annmcentire52@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Max', 'YOUNG', '', '340 THIRD ST.', 'Ft. Lupton', 'CO', '80621', '', '(719) 322-5870', 'RV TYPE= AS 1966', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'YOUNG' AND UPPER(first_name) = 'MAX'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Josh', 'EGAN', '', '2479 ALTO ST', 'Fort Lupton', 'CO', '80621', 'jegan70494@gmail.com', '(303) 834-0910', 'RV TYPE= GENESIS 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EGAN' AND UPPER(first_name) = 'JOSH') OR LOWER(email_primary) = 'jegan70494@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gamaliel', 'CASTRO', '', '245 83RD AVE.', 'Greeley', 'CO', '80634', 'castro7@comcast.net', '(720) 539-4098', 'RV TYPE= MERCEDES LEISUREVAN', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CASTRO' AND UPPER(first_name) = 'GAMALIEL') OR LOWER(email_primary) = 'castro7@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Gary', 'VIGIL', '', '11420 PEORIA ST', 'Henderson', 'CO', '80640', 'garyvigil96@yahoo.com', '(303) 885-8399', 'RV TYPE= STRYKER TT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VIGIL' AND UPPER(first_name) = 'GARY') OR LOWER(email_primary) = 'garyvigil96@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ted', 'ABAD', '', '9720 E. 112TH PLACE', 'Henderson', 'CO', '80640', 'jtabad@comcast.net', '(720) 939-9517', 'RV TYPE= SHAMROCK FLAGSTAFF 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ABAD' AND UPPER(first_name) = 'TED') OR LOWER(email_primary) = 'jtabad@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Zak', 'KOHLER', '', '9231 E 107TH PLACE', 'Henderson', 'CO', '80640', 'zakkohler@gmail.com', '(703) 863-9061', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOHLER' AND UPPER(first_name) = 'ZAK') OR LOWER(email_primary) = 'zakkohler@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nick', 'MURCHIE', '', '10915 E 115TH PLACE', 'Commerce City', 'CO', '80640', 'nick.murchie81@gmail.com', '(701) 350-1813', 'RV TYPE= JAYCO 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MURCHIE' AND UPPER(first_name) = 'NICK') OR LOWER(email_primary) = 'nick.murchie81@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Carol Ann Hartnagle', 'KEN MADSEN', '', '12121 POTOMAC ST', 'Henderson', 'CO', '80640', 'madsenken09@gmail.com', '(720) 261-5886', 'Alt email: carolhartnagle@aol.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KEN MADSEN' AND UPPER(first_name) = 'CAROL ANN HARTNAGLE') OR LOWER(email_primary) = 'madsenken09@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'GRADY', '', '11044 NOME ST.', 'Henderson', 'CO', '80640', 'bigticket2133@yahoo.com', '(720) 226-6328', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRADY' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'bigticket2133@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael/Paula', 'SERRANO', '', '5332 LUPINE COURT', 'Henderson', 'CO', '80640', '', '(720) 238-2499', 'RV TYPE= JAYCO FLIGHT', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SERRANO' AND UPPER(first_name) = 'MICHAEL/PAULA'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Samuel', 'RUST', '', '12257 LEVI CIRCLE', 'Henderson', 'CO', '80640', 'sam@lifebridger@gmail.com', '(720) 737-3111', 'RV TYPE= PROWLER 1998', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RUST' AND UPPER(first_name) = 'SAMUEL') OR LOWER(email_primary) = 'sam@lifebridger@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark/Dawn', 'PHILLIPS/LAWRENCE', '', '11321 KINGSTON ST.', 'Henderson', 'CO', '80640', 'markphillips1313@gmail.com', '(970) 302-5893', 'RV TYPE= JAYCO 26 BH', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PHILLIPS/LAWRENCE' AND UPPER(first_name) = 'MARK/DAWN') OR LOWER(email_primary) = 'markphillips1313@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Christopher', 'THAO', '', '11455 JAMAICA ST', 'Henderson', 'CO', '80640', 'thao.christopher@gmail.com', '(720) 341-8744', 'RV TYPE= GD IMAGINE 2019', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'THAO' AND UPPER(first_name) = 'CHRISTOPHER') OR LOWER(email_primary) = 'thao.christopher@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'VIGIL', '', '12275 URSULA ST', 'Henderson', 'CO', '80640', 'ronscc@outlook.com', '(720) 936-2994', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VIGIL' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'ronscc@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ken', 'KOGER', '', '11239 LIMA ST.', 'Henderson', 'CO', '80640', 'mbexpress09@gmail.com', '(720) 240-7220', 'RV TYPE= JAYCO JAYFEATHER 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KOGER' AND UPPER(first_name) = 'KEN') OR LOWER(email_primary) = 'mbexpress09@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Don & Lisa', 'EGAN', '', '12561 RACINE ST.', 'Henderson', 'CO', '80640', 'degan704@gmail.com', '(303) 659-4856', 'RV TYPE= RENEGADE XL 2021 | Alt phone: (303) 478-5190', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EGAN' AND UPPER(first_name) = 'DON & LISA') OR LOWER(email_primary) = 'degan704@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joni', 'JIRASEK', '', '8341 E 104TH WAY', 'Henderson', 'CO', '80640', 'jirasekjoni@gmail.com', '(913) 302-0366', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JIRASEK' AND UPPER(first_name) = 'JONI') OR LOWER(email_primary) = 'jirasekjoni@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brian', 'MCCOY', '', '12300 WHEELING ST.', 'Henderson', 'CO', '80640', 'brianlmccoy@gmail.com', '(303) 801-8206', 'RV TYPE= OUTDOORS RV 2022', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MCCOY' AND UPPER(first_name) = 'BRIAN') OR LOWER(email_primary) = 'brianlmccoy@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jennifer', 'EADS', '', '704 PRAIRIE CLOVER WAY', 'Brighton', 'CO', '80640', 'jennifereads82@gmail.com', '(720) 939-5366', 'RV TYPE= COACHMAN FREELANDER 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'EADS' AND UPPER(first_name) = 'JENNIFER') OR LOWER(email_primary) = 'jennifereads82@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ken', 'HANEY', '', '9259 LONGS PEAK DR.', 'Henderson', 'CO', '80640', 'haney.ken.c@gmail.com', '(720) 544-1144', 'RV TYPE= GD 17MKE', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HANEY' AND UPPER(first_name) = 'KEN') OR LOWER(email_primary) = 'haney.ken.c@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Maria', 'RENTERIA', '', '820 1ST ST', 'Hudson', 'CO', '80642', 'mrmsdiva@gmail.com', '(972) 900-2193', 'RV TYPE= SUNSEEKER 2014', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RENTERIA' AND UPPER(first_name) = 'MARIA') OR LOWER(email_primary) = 'mrmsdiva@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Rolayne', 'VOLPE', '', '', '', '', '80642', 'rolaynevolpe@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VOLPE' AND UPPER(first_name) = 'ROLAYNE') OR LOWER(email_primary) = 'rolaynevolpe@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Richard', 'DEFEYTER', '', '35905 E 149TH CT.', 'Hudson', 'CO', '80642', '', '(303) 910-2221', 'RV TYPE= FR SHOCKWAVE 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEFEYTER' AND UPPER(first_name) = 'RICHARD'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Robert', 'VOLPE', '', '16715 SHADOWWOOD COURT', 'Hudson', 'CO', '80642', '', '(931) 624-2045', 'RV TYPE= WINNEBAGO CHALET', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'VOLPE' AND UPPER(first_name) = 'ROBERT'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ben', 'BRADEN', '', '38080 E 149TH PLACE', 'Keenesburg', 'CO', '80643', 'snowx74@yahoo.com', '(303) 718-0773', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BRADEN' AND UPPER(first_name) = 'BEN') OR LOWER(email_primary) = 'snowx74@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nolan', 'SHAFFER', '', '29521 CO RD 39B', 'Keenesburg', 'CO', '80643', 'nolan.shaffer@yahoo.com', '(530) 260-8387', 'RV TYPE= BROOKSTONE 5TH WHEEL 2020', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHAFFER' AND UPPER(first_name) = 'NOLAN') OR LOWER(email_primary) = 'nolan.shaffer@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Chris', 'SPAHN', '', '435 COUNTY ROAD 63', 'Keenesburg', 'CO', '80643', 'spahn.christopher1@yahoo.com', '(303) 885-7305', 'RV TYPE= FR FREEDOM 232', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SPAHN' AND UPPER(first_name) = 'CHRIS') OR LOWER(email_primary) = 'spahn.christopher1@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Cole & Tennessee', 'RIFE/WORDINGHAM', '', '29521 CO RD 398 #56', 'Keenesburg', 'CO', '80643', 'twordingham@gmail.com', '(406) 594-4125', 'RV TYPE= HEARTLAND BIGHORN 2016 36''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'RIFE/WORDINGHAM' AND UPPER(first_name) = 'COLE & TENNESSEE') OR LOWER(email_primary) = 'twordingham@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Larry', 'SWITZER', '', '12059 IVY CIRCLE', 'Brighton', 'CO', '80662', '', '(303) 868-6999', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SWITZER' AND UPPER(first_name) = 'LARRY'));

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lee', 'BROWN', '', '5328 COUNTY ROAD 73', 'Fleming', 'CO', '80728', 'brownl54@hotmail.com', '(970) 466-1514', 'RV TYPE= WILDCAT 5TH WHEEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BROWN' AND UPPER(first_name) = 'LEE') OR LOWER(email_primary) = 'brownl54@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Phil', 'MARTIN', '', '795 FOX HILL CT', 'Boulder', 'CO', '80803', 'prm3rd@gmail.com', '(303) 489-9041', 'RV TYPE= AS SAFARI 2006', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MARTIN' AND UPPER(first_name) = 'PHIL') OR LOWER(email_primary) = 'prm3rd@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Glenn', 'BARROWMAN', '', '1069 LAKEVIEW FOREST HEIGHTS', 'Florissant', 'CO', '80816', 'glennjb@yahoo.com', '(719) 689-5854', 'RV TYPE= AS CARAVEL', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BARROWMAN' AND UPPER(first_name) = 'GLENN') OR LOWER(email_primary) = 'glennjb@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Doug', 'FRANQUEMONT', '', '2230 LEE CIRCLE ROAD', 'Woodland Park', 'CO', '80863', 'dfranque@mac.com', '(719) 337-1312', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRANQUEMONT' AND UPPER(first_name) = 'DOUG') OR LOWER(email_primary) = 'dfranque@mac.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew', 'MASULLO', '', '1153 SUNLIT DRIVE', 'Castle Rock', 'CO', '80901', 'amasullo@msn.com', '(281) 923-6946', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MASULLO' AND UPPER(first_name) = 'ANDREW') OR LOWER(email_primary) = 'amasullo@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike', 'ARMSTRONG', '', '1235 MARKSTONE PLACE', 'Colorado Springs', 'CO', '80904', 'mikearmstrong@comcast.net', '(719) 661-4378', 'RV TYPE= COUGAR TRA/REM 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ARMSTRONG' AND UPPER(first_name) = 'MIKE') OR LOWER(email_primary) = 'mikearmstrong@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trevor', 'PETERSON', '', '2704 NORTHRIDGEDRIVE', 'Colorado Springs', 'CO', '80918', 'peterta08@gmail.com', '(719) 271-7115', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PETERSON' AND UPPER(first_name) = 'TREVOR') OR LOWER(email_primary) = 'peterta08@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Doug', 'HUTTENLOCKER', '', '1960 ANASAZI CT.', 'Colorado Springs', 'CO', '80919', 'dhuttenlocker@yahoo.com', '(334) 322-3451', 'RV TYPE= AS BASECAMP 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HUTTENLOCKER' AND UPPER(first_name) = 'DOUG') OR LOWER(email_primary) = 'dhuttenlocker@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mike And Shirley', 'SHERRILL', '', '15931 RED FOX LANE', 'Colorado Springs', 'CO', '80921', 'swsherrill@icloud.com', '(714) 747-0924', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHERRILL' AND UPPER(first_name) = 'MIKE AND SHIRLEY') OR LOWER(email_primary) = 'swsherrill@icloud.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kurt& Valerie', 'KINDERWATER', '', '2003 DIAMOND CREEK DR.', 'Colorado Springs', 'CO', '80921', 'vkinderwater@yahoo.com', '(719) 323-0266', 'Alt phone: (719) 671-6217', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KINDERWATER' AND UPPER(first_name) = 'KURT& VALERIE') OR LOWER(email_primary) = 'vkinderwater@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michael', 'CARMICHAEL', '', '1800 USFS RD 510', 'Creede', 'CO', '81130', 'mjbecar@aol.com', '(352) 572-0457', 'NO: 70109 R/O: Sep 19 2024 - 15:36 ID: 1 ******************** | Alt email: statefarmclaims@statefarm.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CARMICHAEL' AND UPPER(first_name) = 'MICHAEL') OR LOWER(email_primary) = 'mjbecar@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Joe', 'CALANDRA', '', '919 BRISTLECONE DR', 'Pagosa Springs', 'CO', '81147', 'kyro-2@comcast.net', '(720) 326-3369', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CALANDRA' AND UPPER(first_name) = 'JOE') OR LOWER(email_primary) = 'kyro-2@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Luke & Stephanie', 'JILLINGS', '', 'PO BOX 4872', 'Buena Vista', 'CO', '81211', 'ljjillings@gmail.com', '(207) 289-8902', 'SUTTON GAUER - BUYER - 904-466-9452 - THEY WILL CONTACT US WHEN READY TO PICK UP | Alt phone: (720) 390-1885', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JILLINGS' AND UPPER(first_name) = 'LUKE & STEPHANIE') OR LOWER(email_primary) = 'ljjillings@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Alan', 'SHUPE', '', 'PO BOX 137', 'Durango', 'CO', '81302', 'jalanshupe@hotmail.com', '(970) 749-8750', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SHUPE' AND UPPER(first_name) = 'ALAN') OR LOWER(email_primary) = 'jalanshupe@hotmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Michelle', 'GRIFFITH', '', 'PO BOX 1722', 'Telluride', 'CO', '81435', 'michellemg91@gmail.com', '(720) 883-7265', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GRIFFITH' AND UPPER(first_name) = 'MICHELLE') OR LOWER(email_primary) = 'michellemg91@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brandon', 'MALLOY', '', '439 30 1/2 ROAD', 'Grand Junction', 'CO', '81504', 'brandonmalloy22@gmail.com', '(970) 986-9614', 'RV TYPE= FR 2021', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MALLOY' AND UPPER(first_name) = 'BRANDON') OR LOWER(email_primary) = 'brandonmalloy22@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brooke', 'L. WALLS', '', '30 MEADOW WOOD ROAD', 'Glenwood Springs', 'CO', '81601', 'bwalls78@gmail.com', '', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'L. WALLS' AND UPPER(first_name) = 'BROOKE') OR LOWER(email_primary) = 'bwalls78@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Trent', 'LICHTENWALTER', '', '22 KINGFISHER', 'Carbondale', 'CO', '81623', 'trent.lichtenwalter@gmail.com', '(970) 987-4774', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LICHTENWALTER' AND UPPER(first_name) = 'TRENT') OR LOWER(email_primary) = 'trent.lichtenwalter@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'DEWALD', '', '24 SHEDHORN CT.', 'Eagle', 'CO', '81631', 'bradleyr.dewald@gmail.com', '(970) 471-8007', 'RV TYPE= KEYSTONE HIDEOUT 21''', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'DEWALD' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'bradleyr.dewald@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Peter', 'GEYER', '', 'PO Box 755', 'Gypsum', 'CO', '81637', 'peter.geyer@psivail.com', '(970) 331-6392', 'Warranty work requested by Airstream Corrporate. Airstream will pay for this invoice.  6-8 weeks for check to be received from 2/20/2023. Christina at Airstream. | Alt email: pgeyer6392@gmail.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GEYER' AND UPPER(first_name) = 'PETER') OR LOWER(email_primary) = 'peter.geyer@psivail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Nick', 'HODGES', '', '534 E. 3RD ST.  UNIT E106', 'Eagle', 'CO', '81645', 'nickhodges1213@gmail.com', '(727) 366-9630', 'RV TYPE= FR WILDWOOD 2018', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'HODGES' AND UPPER(first_name) = 'NICK') OR LOWER(email_primary) = 'nickhodges1213@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kevin', 'BOYETTE', '', '109 HAYSTACK LANE', 'Snowmass', 'CO', '81654', 'kevin@personalchefkauai.com', '(808) 651-0883', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'BOYETTE' AND UPPER(first_name) = 'KEVIN') OR LOWER(email_primary) = 'kevin@personalchefkauai.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kenneth', 'LASHER', '', '2289 CHAMONIX LANE', 'Vail', 'CO', '81657', 'kclasher@gmail.com', '(970) 390-6598', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'LASHER' AND UPPER(first_name) = 'KENNETH') OR LOWER(email_primary) = 'kclasher@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Penny / John', 'WILSON / PICCIOTTO', '', '2350 BALD MOUNTAIN ROAD  #A6', 'Vail', 'CO', '81657', 'penlynwilson@gmail.com', '(713) 822-8500', 'RV TYPE= AS GLOBETROTTER 23FBGT | Alt phone: (281) 536-2768', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WILSON / PICCIOTTO' AND UPPER(first_name) = 'PENNY / JOHN') OR LOWER(email_primary) = 'penlynwilson@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Andrew & Carolyn', 'STRATTON', '', '929 RED SANDSTONE ROAD #15C', 'Vail', 'CO', '81658', 'andystratton23@comcast.net', '(970) 331-5877', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'STRATTON' AND UPPER(first_name) = 'ANDREW & CAROLYN') OR LOWER(email_primary) = 'andystratton23@comcast.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kyle', 'ELMQUIST', '', '842 TWEED LANE', 'Lander', 'WY', '82520', 'kyleelmquist@gmail.com', '(206) 271-0436', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'ELMQUIST' AND UPPER(first_name) = 'KYLE') OR LOWER(email_primary) = 'kyleelmquist@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dixie', 'MEADLIN', '', '925 DABRICK AVE.', 'Lander', 'WY', '82520', 'dixie.meadlin@gmail.com', '(307) 345-2894', 'RV TYPE= KZ ESCAPE 2017', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MEADLIN' AND UPPER(first_name) = 'DIXIE') OR LOWER(email_primary) = 'dixie.meadlin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'KEIL', '', '20255 E. HWY 26/287', 'Moran', 'WY', '83013', 'markkeil1262@gmail.com', '(541) 417-1262', 'RV TYPE= AS CLASSIC/EXCELLA 1997', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KEIL' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'markkeil1262@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Merceda', 'JACKSON', '', '4738 N SHAW LOOP', 'Coeur D Alene', 'ID', '83815', 'mercedajackson@aol.com', '(208) 929-6941', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'JACKSON' AND UPPER(first_name) = 'MERCEDA') OR LOWER(email_primary) = 'mercedajackson@aol.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Lou', 'FRANKLIN', '', '7338 LONCKI STREET  #56112', 'Hill Afb', 'UT', '84056', 'lou.franklin@gmail.com', '(303) 731-7408', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'FRANKLIN' AND UPPER(first_name) = 'LOU') OR LOWER(email_primary) = 'lou.franklin@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Bill', 'GREENEY', '', '10849 S SHOSHONI DR', 'Phoenix', 'AZ', '85044', 'bgreeney@cox.net', '(480) 496-0999', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GREENEY' AND UPPER(first_name) = 'BILL') OR LOWER(email_primary) = 'bgreeney@cox.net');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Dan', 'KRATISH', '', '10 N STARGAZER', 'Santa Fe', 'NM', '87506', 'kratish4@gmail.com', '(305) 393-1959', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KRATISH' AND UPPER(first_name) = 'DAN') OR LOWER(email_primary) = 'kratish4@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Wendy', 'MORRIS', '', '', 'Las Vegas', 'NV', '89108', 'websitewendy@gmail.com', '(502) 693-5079', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MORRIS' AND UPPER(first_name) = 'WENDY') OR LOWER(email_primary) = 'websitewendy@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Thomas', 'CRAWFORD', '', '8149  PAVAROTTI AVE', 'Las Vegas', 'NV', '89178', 'darthmoss13@gmail.com', '(513) 237-3570', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'CRAWFORD' AND UPPER(first_name) = 'THOMAS') OR LOWER(email_primary) = 'darthmoss13@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Jessica/Ryan', 'SAN JUAN', '', '857 NUTMEG PLACE', 'Reno', 'NV', '89502', 'ryan.evan15@outlook.com', '(775) 846-7154', 'Alt phone: (775) 453-8098', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SAN JUAN' AND UPPER(first_name) = 'JESSICA/RYAN') OR LOWER(email_primary) = 'ryan.evan15@outlook.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Kenzo', 'SCHEERLINCK', '', '801 A ST APT 520', 'San Diego', 'CA', '92101', 'kenzo@scheerlinck.be', '(773) 739-4012', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'SCHEERLINCK' AND UPPER(first_name) = 'KENZO') OR LOWER(email_primary) = 'kenzo@scheerlinck.be');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Emma', 'KRATZBERG', '', '2239 PORT LEWICK PLACE', 'Newport Beach', 'CA', '92660', 'emmy.kratz@yahoo.com', '(949) 698-3299', 'RV TYPE= KEYSTONE SPRINTER 2015', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KRATZBERG' AND UPPER(first_name) = 'EMMA') OR LOWER(email_primary) = 'emmy.kratz@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ron', 'GARBER', '', '20500 VIA MAGDELENA', 'Yorba Linda', 'CA', '92887', 'ron@rongarber.com', '(714) 612-3443', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GARBER' AND UPPER(first_name) = 'RON') OR LOWER(email_primary) = 'ron@rongarber.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Ariel', 'GISPAN', '', '2688 RIVENDALE ROAD', 'Lake Oswego', 'OR', '97034', 'arielgispan@gmail.com', '(971) 243-9024', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'GISPAN' AND UPPER(first_name) = 'ARIEL') OR LOWER(email_primary) = 'arielgispan@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Janelle', 'KEVIN', '', '16819 MT. FOREST BLVD', 'Monroe', 'WA', '98272', 'janellekevin@msn.com', '(425) 246-7977', 'CUSTOMER STORING BOTH THE TRUCK CAMPER AND THE JEEP UNTIL SEPTEMBER 16TH OUTDOOR STORAGE.  JEEP WRANGLER LICENSE PLATE # CBV5604 - WA', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'KEVIN' AND UPPER(first_name) = 'JANELLE') OR LOWER(email_primary) = 'janellekevin@msn.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Giovanni', 'MANDATO', '', '2860 DISCOVERY BAY DR.', 'Anchorage', 'AK', '99515', 'mandato.giovanni@gmail.com', '(907) 444-9504', '', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MANDATO' AND UPPER(first_name) = 'GIOVANNI') OR LOWER(email_primary) = 'mandato.giovanni@gmail.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Mark', 'WOODS', '', '9200 PROSPECT DR.', 'Anchorage', 'AK', '99515', 'woods7448@yahoo.com', '(907) 240-7640', 'RV TYPE= WINNEBAGO VIA 2016', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'WOODS' AND UPPER(first_name) = 'MARK') OR LOWER(email_primary) = 'woods7448@yahoo.com');

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Brad', 'MEYEN', '', '17180 HIDEAWAY RIDGE DR.', 'Eagle River', 'AK', '99577', 'brad.meyen@gmail.com', '(907) 406-9314', 'BRAD RECEIVED $5759.24 FIRST CHECK. SECOND CHECK = $2825.78 | Alt email: joshpayne@geico.com', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'MEYEN' AND UPPER(first_name) = 'BRAD') OR LOWER(email_primary) = 'brad.meyen@gmail.com');

-- REMOVED: header row from spreadsheet (First Name, LAST NAME, STATE, etc.)

INSERT INTO customers (first_name, last_name, company_name, address_street, address_city, address_state, address_zip, email_primary, phone_primary, notes, created_at, updated_at)
SELECT 'Shawn', 'PEET', '', '332 SOUTH HARMONY DR', 'Calgary', 'AB', 'T3Z0E5', 'shawn_peet@hotmail.com', '(403) 888-6101', 'STORING UNTIL 7/26.', NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM customers WHERE (UPPER(last_name) = 'PEET' AND UPPER(first_name) = 'SHAWN') OR LOWER(email_primary) = 'shawn_peet@hotmail.com');

COMMIT;

-- Total records processed: 1222
-- After running, check how many were actually inserted:
-- SELECT COUNT(*) FROM customers;