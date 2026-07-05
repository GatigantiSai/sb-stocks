const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Stock = require('../models/Stock');
const User = require('../models/User');
const Holding = require('../models/Holding');
const Transaction = require('../models/Transaction');
const Watchlist = require('../models/Watchlist');
const Portfolio = require('../models/Portfolio');

dotenv.config();

// Standard 200 US Stock list with real tickers, sectors, and base prices
const baseStocks = [
  // Technology
  { symbol: 'AAPL', companyName: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', price: 175.50 },
  { symbol: 'MSFT', companyName: 'Microsoft Corporation', sector: 'Technology', industry: 'Software—Infrastructure', price: 420.20 },
  { symbol: 'GOOGL', companyName: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', price: 152.30 },
  { symbol: 'AMZN', companyName: 'Amazon.com, Inc.', sector: 'Technology', industry: 'Internet Retail', price: 178.40 },
  { symbol: 'NVDA', companyName: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', price: 875.10 },
  { symbol: 'META', companyName: 'Meta Platforms, Inc.', sector: 'Technology', industry: 'Internet Content & Information', price: 505.40 },
  { symbol: 'TSLA', companyName: 'Tesla, Inc.', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', price: 171.20 },
  { symbol: 'AVGO', companyName: 'Broadcom Inc.', sector: 'Technology', industry: 'Semiconductors', price: 1350.00 },
  { symbol: 'ASML', companyName: 'ASML Holding N.V.', sector: 'Technology', industry: 'Semiconductor Equipment', price: 920.50 },
  { symbol: 'ORCL', companyName: 'Oracle Corporation', sector: 'Technology', industry: 'Software—Application', price: 125.40 },
  { symbol: 'AMD', companyName: 'Advanced Micro Devices, Inc.', sector: 'Technology', industry: 'Semiconductors', price: 180.30 },
  { symbol: 'NFLX', companyName: 'Netflix, Inc.', sector: 'Communication Services', industry: 'Entertainment', price: 610.10 },
  { symbol: 'ADBE', companyName: 'Adobe Inc.', sector: 'Technology', industry: 'Software—Infrastructure', price: 500.50 },
  { symbol: 'CRM', companyName: 'Salesforce, Inc.', sector: 'Technology', industry: 'Software—Application', price: 290.80 },
  { symbol: 'CSCO', companyName: 'Cisco Systems, Inc.', sector: 'Technology', industry: 'Communication Equipment', price: 48.50 },
  { symbol: 'QCOM', companyName: 'QUALCOMM Incorporated', sector: 'Technology', industry: 'Semiconductors', price: 168.20 },
  { symbol: 'INTC', companyName: 'Intel Corporation', sector: 'Technology', industry: 'Semiconductors', price: 42.10 },
  { symbol: 'TXN', companyName: 'Texas Instruments Incorporated', sector: 'Technology', industry: 'Semiconductors', price: 172.40 },
  { symbol: 'NOW', companyName: 'ServiceNow, Inc.', sector: 'Technology', industry: 'Software—Application', price: 760.30 },
  { symbol: 'IBM', companyName: 'International Business Machines Corporation', sector: 'Technology', industry: 'Information Technology Services', price: 190.50 },
  { symbol: 'SAP', companyName: 'SAP SE', sector: 'Technology', industry: 'Software—Application', price: 195.40 },
  { symbol: 'LRCX', companyName: 'Lam Research Corporation', sector: 'Technology', industry: 'Semiconductor Equipment', price: 940.20 },
  { symbol: 'AMAT', companyName: 'Applied Materials, Inc.', sector: 'Technology', industry: 'Semiconductor Equipment', price: 205.10 },
  { symbol: 'PANW', companyName: 'Palo Alto Networks, Inc.', sector: 'Technology', industry: 'Software—Infrastructure', price: 285.40 },
  { symbol: 'SNPS', companyName: 'Synopsys, Inc.', sector: 'Technology', industry: 'Software—Infrastructure', price: 565.30 },
  { symbol: 'CDNS', companyName: 'Cadence Design Systems, Inc.', sector: 'Technology', industry: 'Software—Infrastructure', price: 305.20 },
  { symbol: 'ROP', companyName: 'Roper Technologies, Inc.', sector: 'Technology', industry: 'Software—Application', price: 540.80 },
  { symbol: 'ANET', companyName: 'Arista Networks, Inc.', sector: 'Technology', industry: 'Computer Hardware', price: 275.40 },
  { symbol: 'MCHP', companyName: 'Microchip Technology Incorporated', sector: 'Technology', industry: 'Semiconductors', price: 88.50 },
  { symbol: 'APH', companyName: 'Amphenol Corporation', sector: 'Technology', industry: 'Electronic Components', price: 112.30 },
  
  // Financials
  { symbol: 'BRK.A', companyName: 'Berkshire Hathaway Inc. (Class A)', sector: 'Financials', industry: 'Insurance—Diversified', price: 615000.00 },
  { symbol: 'BRK.B', companyName: 'Berkshire Hathaway Inc. (Class B)', sector: 'Financials', industry: 'Insurance—Diversified', price: 408.50 },
  { symbol: 'JPM', companyName: 'JPMorgan Chase & Co.', sector: 'Financials', industry: 'Banks—Diversified', price: 195.30 },
  { symbol: 'V', companyName: 'Visa Inc.', sector: 'Financials', industry: 'Credit Services', price: 280.40 },
  { symbol: 'MA', companyName: 'Mastercard Incorporated', sector: 'Financials', industry: 'Credit Services', price: 475.20 },
  { symbol: 'BAC', companyName: 'Bank of America Corporation', sector: 'Financials', industry: 'Banks—Diversified', price: 37.20 },
  { symbol: 'WFC', companyName: 'Wells Fargo & Company', sector: 'Financials', industry: 'Banks—Diversified', price: 57.40 },
  { symbol: 'MS', companyName: 'Morgan Stanley', sector: 'Financials', industry: 'Capital Markets', price: 92.50 },
  { symbol: 'GS', companyName: 'The Goldman Sachs Group, Inc.', sector: 'Financials', industry: 'Capital Markets', price: 410.10 },
  { symbol: 'BLK', companyName: 'BlackRock, Inc.', sector: 'Financials', industry: 'Asset Management', price: 820.30 },
  { symbol: 'AXP', companyName: 'American Express Company', sector: 'Financials', industry: 'Credit Services', price: 220.50 },
  { symbol: 'C', companyName: 'Citigroup Inc.', sector: 'Financials', industry: 'Banks—Diversified', price: 61.20 },
  { symbol: 'SCHW', companyName: 'The Charles Schwab Corporation', sector: 'Financials', industry: 'Capital Markets', price: 71.40 },
  { symbol: 'SPGI', companyName: 'S&P Global Inc.', sector: 'Financials', industry: 'Financial Data & Stock Exchanges', price: 425.20 },
  { symbol: 'MMC', companyName: 'Marsh & McLennan Companies, Inc.', sector: 'Financials', industry: 'Insurance Brokers', price: 200.50 },
  { symbol: 'PGR', companyName: 'The Progressive Corporation', sector: 'Financials', industry: 'Insurance—Property & Casualty', price: 210.40 },
  { symbol: 'CB', companyName: 'Chubb Limited', sector: 'Financials', industry: 'Insurance—Property & Casualty', price: 250.30 },
  { symbol: 'MET', companyName: 'MetLife, Inc.', sector: 'Financials', industry: 'Insurance—Life', price: 72.50 },
  { symbol: 'AON', companyName: 'Aon plc', sector: 'Financials', industry: 'Insurance Brokers', price: 315.40 },
  { symbol: 'AJG', companyName: 'Arthur J. Gallagher & Co.', sector: 'Financials', industry: 'Insurance Brokers', price: 245.20 },
  
  // Healthcare
  { symbol: 'LLY', companyName: 'Eli Lilly and Company', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 760.40 },
  { symbol: 'UNH', companyName: 'UnitedHealth Group Incorporated', sector: 'Healthcare', industry: 'Healthcare Plans', price: 485.50 },
  { symbol: 'JNJ', companyName: 'Johnson & Johnson', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 155.20 },
  { symbol: 'MRK', companyName: 'Merck & Co., Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 125.30 },
  { symbol: 'ABBV', companyName: 'AbbVie Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 175.40 },
  { symbol: 'PFE', companyName: 'Pfizer Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 27.80 },
  { symbol: 'TMO', companyName: 'Thermo Fisher Scientific Inc.', sector: 'Healthcare', industry: 'Diagnostics & Research', price: 575.20 },
  { symbol: 'ABT', companyName: 'Abbott Laboratories', sector: 'Healthcare', industry: 'Medical Devices', price: 110.50 },
  { symbol: 'DHR', companyName: 'Danaher Corporation', sector: 'Healthcare', industry: 'Diagnostics & Research', price: 245.30 },
  { symbol: 'BMY', companyName: 'Bristol-Myers Squibb Company', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 51.40 },
  { symbol: 'AMGN', companyName: 'Amgen Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 270.80 },
  { symbol: 'GILD', companyName: 'Gilead Sciences, Inc.', sector: 'Healthcare', industry: 'Drug Manufacturers—General', price: 72.10 },
  { symbol: 'ISRG', companyName: 'Intuitive Surgical, Inc.', sector: 'Healthcare', industry: 'Medical Devices', price: 385.20 },
  { symbol: 'CVS', companyName: 'CVS Health Corporation', sector: 'Healthcare', industry: 'Healthcare Plans', price: 74.30 },
  { symbol: 'REGN', companyName: 'Regeneron Pharmaceuticals, Inc.', sector: 'Healthcare', industry: 'Biotechnology', price: 950.50 },
  { symbol: 'VRTX', companyName: 'Vertex Pharmaceuticals Incorporated', sector: 'Healthcare', industry: 'Biotechnology', price: 415.20 },
  { symbol: 'CI', companyName: 'The Cigna Group', sector: 'Healthcare', industry: 'Healthcare Plans', price: 360.40 },
  { symbol: 'BDX', companyName: 'Becton, Dickinson and Company', sector: 'Healthcare', industry: 'Medical Instruments & Supplies', price: 235.10 },
  { symbol: 'MCK', companyName: 'McKesson Corporation', sector: 'Healthcare', industry: 'Medical Distribution', price: 535.40 },
  { symbol: 'BSX', companyName: 'Boston Scientific Corporation', sector: 'Healthcare', industry: 'Medical Devices', price: 68.20 },

  // Consumer Discretionary
  { symbol: 'HD', companyName: 'The Home Depot, Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', price: 385.30 },
  { symbol: 'MCD', companyName: 'McDonald\'s Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', price: 282.10 },
  { symbol: 'NKE', companyName: 'NIKE, Inc.', sector: 'Consumer Discretionary', industry: 'Footwear & Accessories', price: 100.40 },
  { symbol: 'ORLY', companyName: 'O\'Reilly Automotive, Inc.', sector: 'Consumer Discretionary', industry: 'Specialty Retail', price: 1100.00 },
  { symbol: 'LOW', companyName: 'Lowe\'s Companies, Inc.', sector: 'Consumer Discretionary', industry: 'Home Improvement Retail', price: 245.50 },
  { symbol: 'SBUX', companyName: 'Starbucks Corporation', sector: 'Consumer Discretionary', industry: 'Restaurants', price: 90.20 },
  { symbol: 'TJX', companyName: 'The TJX Companies, Inc.', sector: 'Consumer Discretionary', industry: 'Apparel Retail', price: 98.40 },
  { symbol: 'TGT', companyName: 'Target Corporation', sector: 'Consumer Discretionary', industry: 'Discount Stores', price: 168.50 },
  { symbol: 'CMG', companyName: 'Chipotle Mexican Grill, Inc.', sector: 'Consumer Discretionary', industry: 'Restaurants', price: 2850.00 },
  { symbol: 'F', companyName: 'Ford Motor Company', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', price: 12.40 },
  { symbol: 'GM', companyName: 'General Motors Company', sector: 'Consumer Discretionary', industry: 'Auto Manufacturers', price: 44.20 },
  { symbol: 'BKNG', companyName: 'Booking Holdings Inc.', sector: 'Consumer Discretionary', industry: 'Travel Services', price: 3600.00 },
  { symbol: 'MAR', companyName: 'Marriott International, Inc.', sector: 'Consumer Discretionary', industry: 'Lodging', price: 248.50 },
  { symbol: 'HLT', companyName: 'Hilton Worldwide Holdings Inc.', sector: 'Consumer Discretionary', industry: 'Lodging', price: 215.30 },
  { symbol: 'AZO', companyName: 'AutoZone, Inc.', sector: 'Consumer Discretionary', industry: 'Specialty Retail', price: 3050.00 },
  { symbol: 'NVR', companyName: 'NVR, Inc.', sector: 'Consumer Discretionary', industry: 'Residential Construction', price: 7850.00 },
  { symbol: 'LEN', companyName: 'Lennar Corporation', sector: 'Consumer Discretionary', industry: 'Residential Construction', price: 160.20 },
  { symbol: 'DHI', companyName: 'D.R. Horton, Inc.', sector: 'Consumer Discretionary', industry: 'Residential Construction', price: 155.40 },
  { symbol: 'YUM', companyName: 'Yum! Brands, Inc.', sector: 'Consumer Discretionary', industry: 'Restaurants', price: 138.20 },
  { symbol: 'ROST', companyName: 'Ross Stores, Inc.', sector: 'Consumer Discretionary', industry: 'Apparel Retail', price: 142.10 },

  // Consumer Staples
  { symbol: 'WMT', companyName: 'Walmart Inc.', sector: 'Consumer Staples', industry: 'Discount Stores', price: 60.30 },
  { symbol: 'PG', companyName: 'The Procter & Gamble Company', sector: 'Consumer Staples', industry: 'Household & Personal Products', price: 162.40 },
  { symbol: 'KO', companyName: 'The Coca-Cola Company', sector: 'Consumer Staples', industry: 'Beverages—Non-Alcoholic', price: 60.10 },
  { symbol: 'PEP', companyName: 'PepsiCo, Inc.', sector: 'Consumer Staples', industry: 'Beverages—Non-Alcoholic', price: 168.30 },
  { symbol: 'COST', companyName: 'Costco Wholesale Corporation', sector: 'Consumer Staples', industry: 'Discount Stores', price: 725.50 },
  { symbol: 'PM', companyName: 'Philip Morris International Inc.', sector: 'Consumer Staples', industry: 'Tobacco', price: 92.40 },
  { symbol: 'MO', companyName: 'Altria Group, Inc.', sector: 'Consumer Staples', industry: 'Tobacco', price: 43.10 },
  { symbol: 'CL', companyName: 'Colgate-Palmolive Company', sector: 'Consumer Staples', industry: 'Household & Personal Products', price: 88.50 },
  { symbol: 'EL', companyName: 'The Estée Lauder Companies Inc.', sector: 'Consumer Staples', industry: 'Household & Personal Products', price: 145.20 },
  { symbol: 'MDLZ', companyName: 'Mondelez International, Inc.', sector: 'Consumer Staples', industry: 'Confectionery', price: 70.40 },
  { symbol: 'TargetStaple1', companyName: 'Target Grocery Foods Ltd.', sector: 'Consumer Staples', industry: 'Food Distribution', price: 34.20 },
  { symbol: 'KMB', companyName: 'Kimberly-Clark Corporation', sector: 'Consumer Staples', industry: 'Household & Personal Products', price: 128.50 },
  { symbol: 'GIS', companyName: 'General Mills, Inc.', sector: 'Consumer Staples', industry: 'Packaged Foods', price: 68.30 },
  { symbol: 'SYY', companyName: 'Sysco Corporation', sector: 'Consumer Staples', industry: 'Food Distribution', price: 80.20 },
  { symbol: 'STZ', companyName: 'Constellation Brands, Inc.', sector: 'Consumer Staples', industry: 'Beverages—Wineries & Distilleries', price: 265.40 },
  { symbol: 'K', companyName: 'Kellanova', sector: 'Consumer Staples', industry: 'Packaged Foods', price: 56.20 },
  { symbol: 'KR', companyName: 'The Kroger Co.', sector: 'Consumer Staples', industry: 'Grocery Stores', price: 55.40 },
  { symbol: 'HSY', companyName: 'The Hershey Company', sector: 'Consumer Staples', industry: 'Confectionery', price: 192.10 },
  { symbol: 'ADM', companyName: 'Archer-Daniels-Midland Company', sector: 'Consumer Staples', industry: 'Agricultural Input', price: 58.30 },
  { symbol: 'CHD', companyName: 'Church & Dwight Co., Inc.', sector: 'Consumer Staples', industry: 'Household & Personal Products', price: 102.50 },

  // Energy
  { symbol: 'XOM', companyName: 'Exxon Mobil Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated', price: 120.30 },
  { symbol: 'CVX', companyName: 'Chevron Corporation', sector: 'Energy', industry: 'Oil & Gas Integrated', price: 158.40 },
  { symbol: 'COP', companyName: 'ConocoPhillips', sector: 'Energy', industry: 'Oil & Gas E&P', price: 128.50 },
  { symbol: 'SLB', companyName: 'Schlumberger Limited', sector: 'Energy', industry: 'Oil & Gas Equipment & Services', price: 54.20 },
  { symbol: 'EOG', companyName: 'EOG Resources, Inc.', sector: 'Energy', industry: 'Oil & Gas E&P', price: 125.30 },
  { symbol: 'MPC', companyName: 'Marathon Petroleum Corporation', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', price: 202.10 },
  { symbol: 'PSX', companyName: 'Phillips 66', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', price: 162.40 },
  { symbol: 'VLO', companyName: 'Valero Energy Corporation', sector: 'Energy', industry: 'Oil & Gas Refining & Marketing', price: 172.50 },
  { symbol: 'OXY', companyName: 'Occidental Petroleum Corporation', sector: 'Energy', industry: 'Oil & Gas E&P', price: 64.20 },
  { symbol: 'HAL', companyName: 'Halliburton Company', sector: 'Energy', industry: 'Oil & Gas Equipment & Services', price: 38.50 },
  { symbol: 'WMB', companyName: 'The Williams Companies, Inc.', sector: 'Energy', industry: 'Oil & Gas Midstream', price: 38.10 },
  { symbol: 'KMI', companyName: 'Kinder Morgan, Inc.', sector: 'Energy', industry: 'Oil & Gas Midstream', price: 18.20 },
  { symbol: 'ONEOK', companyName: 'ONEOK, Inc.', sector: 'Energy', industry: 'Oil & Gas Midstream', price: 80.40 },
  { symbol: 'HES', companyName: 'Hess Corporation', sector: 'Energy', industry: 'Oil & Gas E&P', price: 150.30 },
  { symbol: 'DVN', companyName: 'Devon Energy Corporation', sector: 'Energy', industry: 'Oil & Gas E&P', price: 50.10 },
  { symbol: 'BAK', companyName: 'Braskem S.A.', sector: 'Energy', industry: 'Chemicals', price: 7.20 },
  { symbol: 'BKR', companyName: 'Baker Hughes Company', sector: 'Energy', industry: 'Oil & Gas Equipment & Services', price: 32.40 },
  { symbol: 'FANG', companyName: 'Diamondback Energy, Inc.', sector: 'Energy', industry: 'Oil & Gas E&P', price: 198.50 },
  { symbol: 'CTRA', companyName: 'Coterra Energy Inc.', sector: 'Energy', industry: 'Oil & Gas E&P', price: 27.20 },
  { symbol: 'APA', companyName: 'APA Corporation', sector: 'Energy', industry: 'Oil & Gas E&P', price: 34.50 },

  // Industrials
  { symbol: 'GE', companyName: 'General Electric Company', sector: 'Industrials', industry: 'Specialty Industrial Machinery', price: 156.40 },
  { symbol: 'HON', companyName: 'Honeywell International Inc.', sector: 'Industrials', industry: 'Conglomerates', price: 198.20 },
  { symbol: 'CAT', companyName: 'Caterpillar Inc.', sector: 'Industrials', industry: 'Farm & Heavy Construction Machinery', price: 360.50 },
  { symbol: 'UPS', companyName: 'United Parcel Service, Inc.', sector: 'Industrials', industry: 'Integrated Freight & Logistics', price: 148.30 },
  { symbol: 'LMT', companyName: 'Lockheed Martin Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', price: 450.40 },
  { symbol: 'UNP', companyName: 'Union Pacific Corporation', sector: 'Industrials', industry: 'Railroads', price: 232.10 },
  { symbol: 'RTX', companyName: 'RTX Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', price: 98.50 },
  { symbol: 'DE', companyName: 'Deere & Company', sector: 'Industrials', industry: 'Farm & Heavy Construction Machinery', price: 390.20 },
  { symbol: 'ADP', companyName: 'Automatic Data Processing, Inc.', sector: 'Industrials', industry: 'Staffing & Employment Services', price: 245.40 },
  { symbol: 'FDX', companyName: 'FedEx Corporation', sector: 'Industrials', industry: 'Integrated Freight & Logistics', price: 265.10 },
  { symbol: 'WM', companyName: 'Waste Management, Inc.', sector: 'Industrials', industry: 'Waste Management', price: 205.30 },
  { symbol: 'NOC', companyName: 'Northrop Grumman Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', price: 460.20 },
  { symbol: 'GD', companyName: 'General Dynamics Corporation', sector: 'Industrials', industry: 'Aerospace & Defense', price: 282.40 },
  { symbol: 'CSX', companyName: 'CSX Corporation', sector: 'Industrials', industry: 'Railroads', price: 36.10 },
  { symbol: 'NSC', companyName: 'Norfolk Southern Corporation', sector: 'Industrials', industry: 'Railroads', price: 240.50 },
  { symbol: 'ITW', companyName: 'Illinois Tool Works Inc.', sector: 'Industrials', industry: 'Industrial Distribution', price: 262.30 },
  { symbol: 'EMR', companyName: 'Emerson Electric Co.', sector: 'Industrials', industry: 'Industrial Distribution', price: 112.40 },
  { symbol: 'ETN', companyName: 'Eaton Corporation plc', sector: 'Industrials', industry: 'Specialty Industrial Machinery', price: 295.50 },
  { symbol: 'PH', companyName: 'Parker-Hannifin Corporation', sector: 'Industrials', industry: 'Industrial Distribution', price: 520.10 },
  { symbol: 'MMM', companyName: '3M Company', sector: 'Industrials', industry: 'Conglomerates', price: 104.20 },

  // Communication Services
  { symbol: 'DIS', companyName: 'The Walt Disney Company', sector: 'Communication Services', industry: 'Entertainment', price: 115.30 },
  { symbol: 'CMCSA', companyName: 'Comcast Corporation', sector: 'Communication Services', industry: 'Entertainment', price: 42.10 },
  { symbol: 'TMUS', companyName: 'T-Mobile US, Inc.', sector: 'Communication Services', industry: 'Telecom Services', price: 162.50 },
  { symbol: 'T', companyName: 'AT&T Inc.', sector: 'Communication Services', industry: 'Telecom Services', price: 17.20 },
  { symbol: 'VZ', companyName: 'Verizon Communications Inc.', sector: 'Communication Services', industry: 'Telecom Services', price: 40.50 },
  { symbol: 'CHTR', companyName: 'Charter Communications, Inc.', sector: 'Communication Services', industry: 'Entertainment', price: 290.40 },
  { symbol: 'EA', companyName: 'Electronic Arts Inc.', sector: 'Communication Services', industry: 'Electronic Gaming & Multimedia', price: 130.20 },
  { symbol: 'TTWO', companyName: 'Take-Two Interactive Software, Inc.', sector: 'Communication Services', industry: 'Electronic Gaming & Multimedia', price: 148.50 },
  { symbol: 'WBD', companyName: 'Warner Bros. Discovery, Inc.', sector: 'Communication Services', industry: 'Entertainment', price: 8.40 },
  { symbol: 'FOXA', companyName: 'Fox Corporation (Class A)', sector: 'Communication Services', industry: 'Entertainment', price: 30.50 },
  { symbol: 'FOX', companyName: 'Fox Corporation (Class B)', sector: 'Communication Services', industry: 'Entertainment', price: 28.20 },
  { symbol: 'OMC', companyName: 'Omnicom Group Inc.', sector: 'Communication Services', industry: 'Advertising Agencies', price: 92.40 },
  { symbol: 'IPG', companyName: 'The Interpublic Group of Companies, Inc.', sector: 'Communication Services', industry: 'Advertising Agencies', price: 32.10 },
  { symbol: 'MTCH', companyName: 'Match Group, Inc.', sector: 'Communication Services', industry: 'Internet Content & Information', price: 34.50 },
  { symbol: 'IAC', companyName: 'IAC Inc.', sector: 'Communication Services', industry: 'Internet Content & Information', price: 52.30 },
  { symbol: 'LBRDA', companyName: 'Liberty Broadband Corporation', sector: 'Communication Services', industry: 'Entertainment', price: 60.10 },
  { symbol: 'NWSA', companyName: 'News Corporation (Class A)', sector: 'Communication Services', industry: 'Publishing', price: 25.40 },
  { symbol: 'NWS', companyName: 'News Corporation (Class B)', sector: 'Communication Services', industry: 'Publishing', price: 24.30 },
  { symbol: 'DISH', companyName: 'DISH Network Corporation', sector: 'Communication Services', industry: 'Telecom Services', price: 5.20 },
  { symbol: 'NYT', companyName: 'The New York Times Company', sector: 'Communication Services', industry: 'Publishing', price: 44.50 },

  // Real Estate / Utilities / Materials
  { symbol: 'PLD', companyName: 'Prologis, Inc.', sector: 'Real Estate', industry: 'REIT—Industrial', price: 122.40 },
  { symbol: 'AMT', companyName: 'American Tower Corporation', sector: 'Real Estate', industry: 'REIT—Specialty', price: 195.30 },
  { symbol: 'CCI', companyName: 'Crown Castle Inc.', sector: 'Real Estate', industry: 'REIT—Specialty', price: 105.10 },
  { symbol: 'EQIX', companyName: 'Equinix, Inc.', sector: 'Real Estate', industry: 'REIT—Specialty', price: 780.20 },
  { symbol: 'PSA', companyName: 'Public Storage', sector: 'Real Estate', industry: 'REIT—Industrial', price: 285.50 },
  { symbol: 'O', companyName: 'Realty Income Corporation', sector: 'Real Estate', industry: 'REIT—Retail', price: 52.40 },
  { symbol: 'SPG', companyName: 'Simon Property Group, Inc.', sector: 'Real Estate', industry: 'REIT—Retail', price: 145.20 },
  { symbol: 'WELL', companyName: 'Welltower Inc.', sector: 'Real Estate', industry: 'REIT—Healthcare', price: 92.50 },
  { symbol: 'DLR', companyName: 'Digital Realty Trust, Inc.', sector: 'Real Estate', industry: 'REIT—Specialty', price: 142.30 },
  { symbol: 'WY', companyName: 'Weyerhaeuser Company', sector: 'Real Estate', industry: 'REIT—Specialty', price: 34.20 },
  { symbol: 'NEE', companyName: 'NextEra Energy, Inc.', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 62.40 },
  { symbol: 'DUK', companyName: 'Duke Energy Corporation', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 96.50 },
  { symbol: 'SO', companyName: 'The Southern Company', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 70.30 },
  { symbol: 'AEP', companyName: 'American Electric Power Company, Inc.', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 82.50 },
  { symbol: 'D', companyName: 'Dominion Energy, Inc.', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 47.40 },
  { symbol: 'SRE', companyName: 'Sempra', sector: 'Utilities', industry: 'Utilities—Regulated Gas', price: 68.20 },
  { symbol: 'EXC', companyName: 'Exelon Corporation', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 37.50 },
  { symbol: 'XEL', companyName: 'Xcel Energy Inc.', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 53.40 },
  { symbol: 'PEG', companyName: 'Public Service Enterprise Group Incorporated', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 65.20 },
  { symbol: 'ED', companyName: 'Consolidated Edison, Inc.', sector: 'Utilities', industry: 'Utilities—Regulated Electric', price: 90.10 }
];

// Helper to fill the list up to 200 stocks if we are short
const generateRemainingStocks = (list) => {
  const currentLen = list.length;
  const targetLen = 200;
  const sectors = ['Technology', 'Financials', 'Healthcare', 'Consumer Discretionary', 'Consumer Staples', 'Energy', 'Industrials', 'Communication Services', 'Real Estate', 'Utilities'];
  const industries = {
    'Technology': ['Software—Infrastructure', 'Semiconductors', 'Consumer Electronics', 'Software—Application'],
    'Financials': ['Banks—Diversified', 'Credit Services', 'Capital Markets', 'Insurance Brokers'],
    'Healthcare': ['Drug Manufacturers—General', 'Diagnostics & Research', 'Medical Devices', 'Biotechnology'],
    'Consumer Discretionary': ['Restaurants', 'Specialty Retail', 'Auto Manufacturers', 'Lodging'],
    'Consumer Staples': ['Household & Personal Products', 'Discount Stores', 'Beverages—Non-Alcoholic', 'Packaged Foods'],
    'Energy': ['Oil & Gas Integrated', 'Oil & Gas E&P', 'Oil & Gas Midstream', 'Oil & Gas Equipment & Services'],
    'Industrials': ['Aerospace & Defense', 'Railroads', 'Farm & Heavy Construction Machinery', 'Conglomerates'],
    'Communication Services': ['Telecom Services', 'Entertainment', 'Advertising Agencies', 'Publishing'],
    'Real Estate': ['REIT—Industrial', 'REIT—Retail', 'REIT—Specialty', 'REIT—Healthcare'],
    'Utilities': ['Utilities—Regulated Electric', 'Utilities—Regulated Gas', 'Utilities—Regulated Water']
  };

  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  for (let i = currentLen; i < targetLen; i++) {
    const sector = sectors[i % sectors.length];
    const indList = industries[sector];
    const industry = indList[i % indList.length];
    
    // Generate a random unique ticker
    let ticker = '';
    while (true) {
      ticker = letters[Math.floor(Math.random() * 26)] + 
               letters[Math.floor(Math.random() * 26)] + 
               letters[Math.floor(Math.random() * 26)] + 
               letters[Math.floor(Math.random() * 26)];
      if (!list.some(s => s.symbol === ticker)) {
        break;
      }
    }

    const price = parseFloat((Math.random() * 290 + 10).toFixed(2));
    list.push({
      symbol: ticker,
      companyName: `Global ${sector} Holdings Corp ${ticker}`,
      sector: sector,
      industry: industry,
      price: price
    });
  }
};

// Generates 30 days of historical prices with a random walk
const generateHistory = (basePrice) => {
  const history = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = 30; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    
    // Random walk: percentage change between -3% and +3%
    const changePct = (Math.random() * 6 - 3) / 100;
    currentPrice = parseFloat((currentPrice * (1 + changePct)).toFixed(2));
    
    // Ensure price never hits <= 0
    if (currentPrice <= 0.5) currentPrice = 0.5;

    history.push({
      date: date,
      price: currentPrice
    });
  }
  return {
    history,
    finalPrice: currentPrice
  };
};

const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/sb-stocks';
    console.log(`Connecting to database for seeding: ${mongoUri}`);
    await mongoose.connect(mongoUri);
    console.log('Connected to database.');

    // Clear existing collections
    console.log('Clearing existing data...');
    await Stock.deleteMany({});
    await Holding.deleteMany({});
    await Transaction.deleteMany({});
    await Watchlist.deleteMany({});
    await Portfolio.deleteMany({});
    
    // Note: We don't delete users to avoid deleting the admin if already created, 
    // but for seeding we can delete normal users and pre-populate one test admin and one test user
    await User.deleteMany({});

    console.log('Generating stock listings...');
    const allStocks = [...baseStocks];
    generateRemainingStocks(allStocks);

    console.log(`Prepared ${allStocks.length} stocks. Seeding with 30-day historical prices...`);

    const formattedStocks = allStocks.map(stock => {
      const { history, finalPrice } = generateHistory(stock.price);
      
      // Calculate realistic previous close and 52-week metrics
      const prevClose = history[history.length - 2] ? history[history.length - 2].price : stock.price;
      const prices = history.map(h => h.price);
      const high = parseFloat((Math.max(...prices) * 1.1).toFixed(2));
      const low = parseFloat((Math.min(...prices) * 0.9).toFixed(2));
      
      return {
        ...stock,
        price: finalPrice,
        previousClose: prevClose,
        volume: Math.floor(Math.random() * 5000000 + 10000),
        marketCap: Math.floor(finalPrice * (Math.random() * 100000000 + 5000000)),
        high52Week: high,
        low52Week: low,
        historicalPrices: history,
        logo: `https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=80&fit=crop&q=60` // general trading placeholder
      };
    });

    await Stock.insertMany(formattedStocks);
    console.log(`Seeded ${formattedStocks.length} stocks successfully.`);

    // Create test accounts
    console.log('Creating seed accounts...');
    
    // Standard test user (passwords: 'password123')
    const testUser = new User({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      balance: 100000,
      portfolioValue: 100000,
      role: 'user'
    });
    await testUser.save();

    // Standard test admin (passwords: 'admin123')
    const testAdmin = new User({
      name: 'System Admin',
      email: 'admin@example.com',
      password: 'admin123',
      balance: 100000,
      portfolioValue: 100000,
      role: 'admin'
    });
    await testAdmin.save();

    console.log('Seeded User: john@example.com / password123');
    console.log('Seeded Admin: admin@example.com / admin123');

    // Create an initial portfolio snapshot for both users
    const startHistory = [];
    const now = new Date();
    for (let i = 10; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      startHistory.push({
        date: d,
        value: 100000
      });
    }

    await Portfolio.create({
      user: testUser._id,
      valueHistory: startHistory
    });

    await Portfolio.create({
      user: testAdmin._id,
      valueHistory: startHistory
    });

    // Create empty watchlists
    await Watchlist.create({ user: testUser._id, stocks: [] });
    await Watchlist.create({ user: testAdmin._id, stocks: [] });

    console.log('Portfolio and watchlists initialized.');
    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedDatabase();
