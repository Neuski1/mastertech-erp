import sys, os, glob
# Find the file
files = glob.glob('Storage*')
print('Found files:', files)
if not files:
    sys.exit('No file found')
fp = files[0]
print('File size:', os.path.getsize(fp))
with open(fp, 'rb') as f:
    header = f.read(8)
    print('Header bytes:', header)
    print('Is ZIP (xlsx):', header[:4] == b'PK\x03\x04')

try:
    import pandas as pd
    df = pd.read_excel(fp)
    print('\nColumns:', list(df.columns))
    print('\nData:')
    print(df.to_string())
except Exception as e:
    print('pandas error:', e)
