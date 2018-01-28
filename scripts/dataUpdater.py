import requests
import argparse
from datetime import datetime
import psycopg2
import json
'''
This script will be run every night to update the database
from the SYKE interfaces to ensure the newest data
'''



port = "5432"
host = "localhost"
user = "basemap_admin"
passwd = ""
database = "waterhackaton"
schema = "public"


uriLeva = "http://rajapinnat.ymparisto.fi/api/vesla/2.0/odata/YmpHavainto?$top=1&$filter=year(Naytteenotto/Aika)%20eq%20<year>%20and%20month(Naytteenotto/Aika)%20lt%20<month>%20and%20YmpSuure_Id%20eq%2010%20and%20Naytteenotto/Paikka_Id%20eq%20<paikka_id>&$orderby=Naytteenotto_Id%20desc"
uriNakyvuus ="http://rajapinnat.ymparisto.fi/api/vesla/2.0/odata/YmpHavainto?$top=1&$filter=YmpSuure_Id%20eq%204%20and%20Naytteenotto/Paikka_Id%20eq%20<paikka_id>&$orderby=Naytteenotto_Id%20desc"
uriLampo ="http://rajapinnat.ymparisto.fi/api/Hydrologiarajapinta/1.0/odata/LampoPintavesi?$top=1&$filter=Paikka_Id%20eq%20<paikka_id>%20and%20year(Aika)%20eq%20<year>%20and%20month(Aika)%20eq%20<month>%20and%20day(Aika)%20eq%20<day>&$orderby=Aika%20desc"


def parseArgs():
    parser = argparse.ArgumentParser()
    global loggingLevel
    parser.add_argument('-p', default=port, help='Port')
    parser.add_argument('-H', default=host, help='Host')
    parser.add_argument('-u', default=user, help='User')
    parser.add_argument('-w', default=passwd, help='Password')
    parser.add_argument('-d', default=database, help='Database')
    parser.add_argument('-s', default=schema, help='Schema')
    parser.add_argument('date', help="Date in dd.mm.yyyy")
    args = vars(parser.parse_args())
    return args

def getValue(urli):
    r = requests.get(urli)
    data = json.loads(str(r.text))
    print(data)
    val = float(data["value"][0]["Arvo"])
    return val
    
def putToDB(args, data):
    connectionString = "host='{H}' dbname='{d}' user='{u}' port={p} password='{w}'".format(**args)
    conn = psycopg2.connect(connectionString)
    cur = None
    try:
        cur = conn.cursor()
        for datum in data:
            try:
                cur.execute("UPDATE swimmingsites SET leva = %s, nako = %s, lampo = %s WHERE uimavesini = %s", ( datum[1], datum[2], datum[3], datum[0]))
            except:
                print(datum)
        conn.commit()
    finally:
        if cur:
            cur.close()
        conn.close()
    
def loadData(args):
    date = datetime.strptime(args['date'], '%d.%m.%Y')
    firstRow = True
    data = []
    with open("dataSites.csv", "r") as csv:
        for row in csv:
            if not firstRow:
                try:
                    splitted = row.split(",")
                    paikka_id = splitted[1]
                    urli1 = uriLeva.replace("<paikka_id>", splitted[1])
                    urli1 = urli1.replace("<year>", str(date.year))
                    urli1 = urli1.replace("<month>", str(date.month +1))
                    dataForSite=[splitted[0]]
                    
                    dataForSite.append(getValue(urli1)) 
                    urli2 = uriNakyvuus.replace("<paikka_id>", splitted[2])
                    dataForSite.append(getValue(urli2))
                    urli3 = uriLampo.replace("<paikka_id>", splitted[3])
                    urli3 = urli3.replace("<year>", str(date.year))
                    urli3 = urli3.replace("<month>", str(date.month))
                    urli3 = urli3.replace("<day>", str(date.day))
                    dataForSite.append(getValue(urli3))
                except:
                    pass
                print(dataForSite)
                data.append(dataForSite)
            else:
                firstRow = False
    putToDB(args, data)
                

    
    
if __name__=="__main__":
    args = parseArgs()
    loadData(args)