// GENERATED DATA — do not hand-edit. Regenerate from the source below if the
// territory ever needs to change.
//
// Source: simplemaps US Zip Codes Database (Basic/free edition), a
// Census-derived aggregation widely used for exactly this purpose. Mirrored
// as CSV at https://github.com/akinniyi/US-Zip-Codes-With-City-State
// (uszips.csv). Fetched and filtered 2026-09-11.
//
// Filter applied: state = TX, county in the 12 counties CPRNME has defined
// as its service territory (see content/business-info.ts for the framing
// note on why this is "DFW area," not "the DFW MSA").
//
// Known limitations, on purpose rather than by oversight:
//   - No USPS ZIP-type classification (standard / PO-Box-only / unique) —
//     the free dataset doesn't carry this field. If a future page needs to
//     distinguish real delivery ZIPs from PO-Box-only ones, that requires a
//     different (typically paid) USPS-derived source.
//   - Population figures are this dataset's vintage, not independently
//     verified against a specific Census year — useful for relative
//     "is this a real population center or a rural ZIP" judgment, not for
//     any customer-facing statistic.
//   - `spansMultipleCounties: true` means this ZIP's area crosses into
//     another county per the source's weighting data — the county listed
//     here is where the majority of the ZIP falls, not the only county it
//     touches.
//   - This dataset says nothing about whether a repair provider can
//     actually service a given city or ZIP today. That's a separate,
//     deliberately unbuilt "provider availability" question — see the
//     Phase 7 discussion in content/business-info.ts.

export type TerritoryZip = {
  zip: string;
  population: number;
  spansMultipleCounties: boolean;
};

export type TerritoryCity = {
  name: string;
  zips: TerritoryZip[];
};

export type TerritoryCounty = {
  county: string;
  cities: TerritoryCity[];
};

export const dfwTerritoryData: TerritoryCounty[] = [
  {
    "county": "Collin",
    "cities": [
      {
        "name": "Allen",
        "zips": [
          {
            "zip": "75002",
            "population": 63140,
            "spansMultipleCounties": false
          },
          {
            "zip": "75013",
            "population": 30347,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Anna",
        "zips": [
          {
            "zip": "75409",
            "population": 11831,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Blue Ridge",
        "zips": [
          {
            "zip": "75424",
            "population": 3297,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Celina",
        "zips": [
          {
            "zip": "75009",
            "population": 8785,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Dallas",
        "zips": [
          {
            "zip": "75252",
            "population": 24112,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Farmersville",
        "zips": [
          {
            "zip": "75442",
            "population": 8858,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Frisco",
        "zips": [
          {
            "zip": "75035",
            "population": 47553,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Josephine",
        "zips": [
          {
            "zip": "75164",
            "population": 671,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Lavon",
        "zips": [
          {
            "zip": "75166",
            "population": 3070,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "McKinney",
        "zips": [
          {
            "zip": "75069",
            "population": 34108,
            "spansMultipleCounties": false
          },
          {
            "zip": "75070",
            "population": 74734,
            "spansMultipleCounties": false
          },
          {
            "zip": "75071",
            "population": 36090,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Melissa",
        "zips": [
          {
            "zip": "75454",
            "population": 5699,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Nevada",
        "zips": [
          {
            "zip": "75173",
            "population": 4353,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Plano",
        "zips": [
          {
            "zip": "75023",
            "population": 45452,
            "spansMultipleCounties": false
          },
          {
            "zip": "75024",
            "population": 36039,
            "spansMultipleCounties": true
          },
          {
            "zip": "75025",
            "population": 50926,
            "spansMultipleCounties": false
          },
          {
            "zip": "75074",
            "population": 44622,
            "spansMultipleCounties": false
          },
          {
            "zip": "75075",
            "population": 33262,
            "spansMultipleCounties": false
          },
          {
            "zip": "75093",
            "population": 47187,
            "spansMultipleCounties": true
          },
          {
            "zip": "75094",
            "population": 20579,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Princeton",
        "zips": [
          {
            "zip": "75407",
            "population": 14120,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Prosper",
        "zips": [
          {
            "zip": "75078",
            "population": 10592,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Richardson",
        "zips": [
          {
            "zip": "75082",
            "population": 21182,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Wylie",
        "zips": [
          {
            "zip": "75098",
            "population": 48197,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  },
  {
    "county": "Dallas",
    "cities": [
      {
        "name": "Addison",
        "zips": [
          {
            "zip": "75001",
            "population": 12414,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Balch Springs",
        "zips": [
          {
            "zip": "75180",
            "population": 23031,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Carrollton",
        "zips": [
          {
            "zip": "75006",
            "population": 46364,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Cedar Hill",
        "zips": [
          {
            "zip": "75104",
            "population": 45373,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Coppell",
        "zips": [
          {
            "zip": "75019",
            "population": 38666,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Dallas",
        "zips": [
          {
            "zip": "75201",
            "population": 9409,
            "spansMultipleCounties": false
          },
          {
            "zip": "75202",
            "population": 1666,
            "spansMultipleCounties": false
          },
          {
            "zip": "75203",
            "population": 15721,
            "spansMultipleCounties": false
          },
          {
            "zip": "75204",
            "population": 26279,
            "spansMultipleCounties": false
          },
          {
            "zip": "75205",
            "population": 23061,
            "spansMultipleCounties": false
          },
          {
            "zip": "75206",
            "population": 36248,
            "spansMultipleCounties": false
          },
          {
            "zip": "75207",
            "population": 9648,
            "spansMultipleCounties": false
          },
          {
            "zip": "75208",
            "population": 30171,
            "spansMultipleCounties": false
          },
          {
            "zip": "75209",
            "population": 13653,
            "spansMultipleCounties": false
          },
          {
            "zip": "75210",
            "population": 7482,
            "spansMultipleCounties": false
          },
          {
            "zip": "75211",
            "population": 73146,
            "spansMultipleCounties": false
          },
          {
            "zip": "75212",
            "population": 24884,
            "spansMultipleCounties": false
          },
          {
            "zip": "75214",
            "population": 32950,
            "spansMultipleCounties": false
          },
          {
            "zip": "75215",
            "population": 14648,
            "spansMultipleCounties": false
          },
          {
            "zip": "75216",
            "population": 49416,
            "spansMultipleCounties": false
          },
          {
            "zip": "75217",
            "population": 80324,
            "spansMultipleCounties": false
          },
          {
            "zip": "75218",
            "population": 21665,
            "spansMultipleCounties": false
          },
          {
            "zip": "75219",
            "population": 22124,
            "spansMultipleCounties": false
          },
          {
            "zip": "75220",
            "population": 41891,
            "spansMultipleCounties": false
          },
          {
            "zip": "75223",
            "population": 13947,
            "spansMultipleCounties": false
          },
          {
            "zip": "75224",
            "population": 34034,
            "spansMultipleCounties": false
          },
          {
            "zip": "75225",
            "population": 20892,
            "spansMultipleCounties": false
          },
          {
            "zip": "75226",
            "population": 3506,
            "spansMultipleCounties": false
          },
          {
            "zip": "75227",
            "population": 55029,
            "spansMultipleCounties": false
          },
          {
            "zip": "75228",
            "population": 66551,
            "spansMultipleCounties": false
          },
          {
            "zip": "75229",
            "population": 31571,
            "spansMultipleCounties": false
          },
          {
            "zip": "75230",
            "population": 26934,
            "spansMultipleCounties": false
          },
          {
            "zip": "75231",
            "population": 37052,
            "spansMultipleCounties": false
          },
          {
            "zip": "75232",
            "population": 28682,
            "spansMultipleCounties": false
          },
          {
            "zip": "75233",
            "population": 14043,
            "spansMultipleCounties": false
          },
          {
            "zip": "75234",
            "population": 28794,
            "spansMultipleCounties": false
          },
          {
            "zip": "75235",
            "population": 17177,
            "spansMultipleCounties": false
          },
          {
            "zip": "75236",
            "population": 15949,
            "spansMultipleCounties": false
          },
          {
            "zip": "75237",
            "population": 17101,
            "spansMultipleCounties": false
          },
          {
            "zip": "75238",
            "population": 30483,
            "spansMultipleCounties": false
          },
          {
            "zip": "75240",
            "population": 24296,
            "spansMultipleCounties": false
          },
          {
            "zip": "75241",
            "population": 27066,
            "spansMultipleCounties": false
          },
          {
            "zip": "75243",
            "population": 55406,
            "spansMultipleCounties": false
          },
          {
            "zip": "75244",
            "population": 13266,
            "spansMultipleCounties": false
          },
          {
            "zip": "75246",
            "population": 2770,
            "spansMultipleCounties": false
          },
          {
            "zip": "75247",
            "population": 468,
            "spansMultipleCounties": false
          },
          {
            "zip": "75248",
            "population": 33395,
            "spansMultipleCounties": true
          },
          {
            "zip": "75249",
            "population": 13373,
            "spansMultipleCounties": false
          },
          {
            "zip": "75251",
            "population": 2331,
            "spansMultipleCounties": false
          },
          {
            "zip": "75253",
            "population": 18450,
            "spansMultipleCounties": false
          },
          {
            "zip": "75254",
            "population": 23253,
            "spansMultipleCounties": false
          },
          {
            "zip": "75270",
            "population": 0,
            "spansMultipleCounties": false
          },
          {
            "zip": "75390",
            "population": 0,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "DeSoto",
        "zips": [
          {
            "zip": "75115",
            "population": 48877,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Duncanville",
        "zips": [
          {
            "zip": "75116",
            "population": 19669,
            "spansMultipleCounties": false
          },
          {
            "zip": "75137",
            "population": 18861,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Garland",
        "zips": [
          {
            "zip": "75040",
            "population": 59406,
            "spansMultipleCounties": false
          },
          {
            "zip": "75041",
            "population": 30700,
            "spansMultipleCounties": false
          },
          {
            "zip": "75042",
            "population": 37881,
            "spansMultipleCounties": false
          },
          {
            "zip": "75043",
            "population": 58094,
            "spansMultipleCounties": false
          },
          {
            "zip": "75044",
            "population": 40811,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Grand Prairie",
        "zips": [
          {
            "zip": "75050",
            "population": 41041,
            "spansMultipleCounties": true
          },
          {
            "zip": "75051",
            "population": 39285,
            "spansMultipleCounties": true
          },
          {
            "zip": "75052",
            "population": 88996,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Hutchins",
        "zips": [
          {
            "zip": "75141",
            "population": 5374,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Irving",
        "zips": [
          {
            "zip": "75038",
            "population": 27802,
            "spansMultipleCounties": false
          },
          {
            "zip": "75039",
            "population": 11032,
            "spansMultipleCounties": false
          },
          {
            "zip": "75060",
            "population": 45980,
            "spansMultipleCounties": false
          },
          {
            "zip": "75061",
            "population": 53442,
            "spansMultipleCounties": false
          },
          {
            "zip": "75062",
            "population": 44537,
            "spansMultipleCounties": false
          },
          {
            "zip": "75063",
            "population": 35090,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Lancaster",
        "zips": [
          {
            "zip": "75134",
            "population": 20276,
            "spansMultipleCounties": false
          },
          {
            "zip": "75146",
            "population": 17993,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Mesquite",
        "zips": [
          {
            "zip": "75149",
            "population": 56065,
            "spansMultipleCounties": false
          },
          {
            "zip": "75150",
            "population": 58730,
            "spansMultipleCounties": false
          },
          {
            "zip": "75181",
            "population": 25908,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Richardson",
        "zips": [
          {
            "zip": "75080",
            "population": 44009,
            "spansMultipleCounties": true
          },
          {
            "zip": "75081",
            "population": 34156,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Rowlett",
        "zips": [
          {
            "zip": "75088",
            "population": 24712,
            "spansMultipleCounties": true
          },
          {
            "zip": "75089",
            "population": 30251,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Sachse",
        "zips": [
          {
            "zip": "75048",
            "population": 20328,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Seagoville",
        "zips": [
          {
            "zip": "75159",
            "population": 18339,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Sunnyvale",
        "zips": [
          {
            "zip": "75182",
            "population": 5118,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Wilmer",
        "zips": [
          {
            "zip": "75172",
            "population": 3956,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Denton",
    "cities": [
      {
        "name": "Argyle",
        "zips": [
          {
            "zip": "76226",
            "population": 18419,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Aubrey",
        "zips": [
          {
            "zip": "76227",
            "population": 22141,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Carrollton",
        "zips": [
          {
            "zip": "75007",
            "population": 51624,
            "spansMultipleCounties": true
          },
          {
            "zip": "75010",
            "population": 21607,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Dallas",
        "zips": [
          {
            "zip": "75287",
            "population": 49004,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Denton",
        "zips": [
          {
            "zip": "76201",
            "population": 27107,
            "spansMultipleCounties": false
          },
          {
            "zip": "76205",
            "population": 18510,
            "spansMultipleCounties": false
          },
          {
            "zip": "76207",
            "population": 10579,
            "spansMultipleCounties": false
          },
          {
            "zip": "76208",
            "population": 19782,
            "spansMultipleCounties": false
          },
          {
            "zip": "76209",
            "population": 24018,
            "spansMultipleCounties": false
          },
          {
            "zip": "76210",
            "population": 39556,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Flower Mound",
        "zips": [
          {
            "zip": "75022",
            "population": 22545,
            "spansMultipleCounties": true
          },
          {
            "zip": "75028",
            "population": 42226,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Frisco",
        "zips": [
          {
            "zip": "75034",
            "population": 72723,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Justin",
        "zips": [
          {
            "zip": "76247",
            "population": 13098,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Krum",
        "zips": [
          {
            "zip": "76249",
            "population": 7194,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Lake Dallas",
        "zips": [
          {
            "zip": "75065",
            "population": 10748,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Lewisville",
        "zips": [
          {
            "zip": "75057",
            "population": 12900,
            "spansMultipleCounties": false
          },
          {
            "zip": "75067",
            "population": 60982,
            "spansMultipleCounties": true
          },
          {
            "zip": "75077",
            "population": 35330,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Little Elm",
        "zips": [
          {
            "zip": "75068",
            "population": 34934,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Pilot Point",
        "zips": [
          {
            "zip": "76258",
            "population": 6659,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Ponder",
        "zips": [
          {
            "zip": "76259",
            "population": 4618,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Roanoke",
        "zips": [
          {
            "zip": "76262",
            "population": 27648,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Sanger",
        "zips": [
          {
            "zip": "76266",
            "population": 13495,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "The Colony",
        "zips": [
          {
            "zip": "75056",
            "population": 47852,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Ellis",
    "cities": [
      {
        "name": "Avalon",
        "zips": [
          {
            "zip": "76623",
            "population": 242,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Bardwell",
        "zips": [
          {
            "zip": "75101",
            "population": 646,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Ennis",
        "zips": [
          {
            "zip": "75119",
            "population": 26601,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Ferris",
        "zips": [
          {
            "zip": "75125",
            "population": 6691,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Forreston",
        "zips": [
          {
            "zip": "76041",
            "population": 434,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Italy",
        "zips": [
          {
            "zip": "76651",
            "population": 3300,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Maypearl",
        "zips": [
          {
            "zip": "76064",
            "population": 1883,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Midlothian",
        "zips": [
          {
            "zip": "76065",
            "population": 28986,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Milford",
        "zips": [
          {
            "zip": "76670",
            "population": 1377,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Palmer",
        "zips": [
          {
            "zip": "75152",
            "population": 4606,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Red Oak",
        "zips": [
          {
            "zip": "75154",
            "population": 36041,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Waxahachie",
        "zips": [
          {
            "zip": "75165",
            "population": 37966,
            "spansMultipleCounties": false
          },
          {
            "zip": "75167",
            "population": 8436,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Hunt",
    "cities": [
      {
        "name": "Caddo Mills",
        "zips": [
          {
            "zip": "75135",
            "population": 5910,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Campbell",
        "zips": [
          {
            "zip": "75422",
            "population": 2883,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Celeste",
        "zips": [
          {
            "zip": "75423",
            "population": 2982,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Commerce",
        "zips": [
          {
            "zip": "75428",
            "population": 10089,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Greenville",
        "zips": [
          {
            "zip": "75401",
            "population": 18552,
            "spansMultipleCounties": false
          },
          {
            "zip": "75402",
            "population": 15920,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Lone Oak",
        "zips": [
          {
            "zip": "75453",
            "population": 3255,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Quinlan",
        "zips": [
          {
            "zip": "75474",
            "population": 14882,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Wolfe City",
        "zips": [
          {
            "zip": "75496",
            "population": 3351,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  },
  {
    "county": "Kaufman",
    "cities": [
      {
        "name": "Crandall",
        "zips": [
          {
            "zip": "75114",
            "population": 4660,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Forney",
        "zips": [
          {
            "zip": "75126",
            "population": 33396,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Kaufman",
        "zips": [
          {
            "zip": "75142",
            "population": 18982,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Rosser",
        "zips": [
          {
            "zip": "75157",
            "population": 310,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Scurry",
        "zips": [
          {
            "zip": "75158",
            "population": 4139,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Terrell",
        "zips": [
          {
            "zip": "75160",
            "population": 23627,
            "spansMultipleCounties": true
          },
          {
            "zip": "75161",
            "population": 6165,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Rockwall",
    "cities": [
      {
        "name": "Fate",
        "zips": [
          {
            "zip": "75132",
            "population": 294,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Rockwall",
        "zips": [
          {
            "zip": "75032",
            "population": 27986,
            "spansMultipleCounties": false
          },
          {
            "zip": "75087",
            "population": 28145,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Royse City",
        "zips": [
          {
            "zip": "75189",
            "population": 22406,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  },
  {
    "county": "Tarrant",
    "cities": [
      {
        "name": "Arlington",
        "zips": [
          {
            "zip": "76001",
            "population": 30460,
            "spansMultipleCounties": false
          },
          {
            "zip": "76002",
            "population": 30269,
            "spansMultipleCounties": false
          },
          {
            "zip": "76006",
            "population": 22639,
            "spansMultipleCounties": false
          },
          {
            "zip": "76010",
            "population": 55706,
            "spansMultipleCounties": false
          },
          {
            "zip": "76011",
            "population": 21594,
            "spansMultipleCounties": false
          },
          {
            "zip": "76012",
            "population": 25689,
            "spansMultipleCounties": false
          },
          {
            "zip": "76013",
            "population": 30680,
            "spansMultipleCounties": false
          },
          {
            "zip": "76014",
            "population": 34072,
            "spansMultipleCounties": false
          },
          {
            "zip": "76015",
            "population": 16658,
            "spansMultipleCounties": false
          },
          {
            "zip": "76016",
            "population": 30852,
            "spansMultipleCounties": false
          },
          {
            "zip": "76017",
            "population": 44724,
            "spansMultipleCounties": false
          },
          {
            "zip": "76018",
            "population": 26938,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Azle",
        "zips": [
          {
            "zip": "76020",
            "population": 27270,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Bedford",
        "zips": [
          {
            "zip": "76021",
            "population": 33673,
            "spansMultipleCounties": false
          },
          {
            "zip": "76022",
            "population": 13212,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Colleyville",
        "zips": [
          {
            "zip": "76034",
            "population": 22748,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Crowley",
        "zips": [
          {
            "zip": "76036",
            "population": 22352,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Euless",
        "zips": [
          {
            "zip": "76039",
            "population": 32925,
            "spansMultipleCounties": false
          },
          {
            "zip": "76040",
            "population": 27524,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Fort Worth",
        "zips": [
          {
            "zip": "76102",
            "population": 8111,
            "spansMultipleCounties": false
          },
          {
            "zip": "76103",
            "population": 14572,
            "spansMultipleCounties": false
          },
          {
            "zip": "76104",
            "population": 17446,
            "spansMultipleCounties": false
          },
          {
            "zip": "76105",
            "population": 22194,
            "spansMultipleCounties": false
          },
          {
            "zip": "76106",
            "population": 35389,
            "spansMultipleCounties": false
          },
          {
            "zip": "76107",
            "population": 25917,
            "spansMultipleCounties": false
          },
          {
            "zip": "76108",
            "population": 38227,
            "spansMultipleCounties": true
          },
          {
            "zip": "76109",
            "population": 21710,
            "spansMultipleCounties": false
          },
          {
            "zip": "76110",
            "population": 30434,
            "spansMultipleCounties": false
          },
          {
            "zip": "76111",
            "population": 21685,
            "spansMultipleCounties": false
          },
          {
            "zip": "76112",
            "population": 38993,
            "spansMultipleCounties": false
          },
          {
            "zip": "76114",
            "population": 24741,
            "spansMultipleCounties": false
          },
          {
            "zip": "76115",
            "population": 20696,
            "spansMultipleCounties": false
          },
          {
            "zip": "76116",
            "population": 46746,
            "spansMultipleCounties": false
          },
          {
            "zip": "76118",
            "population": 13866,
            "spansMultipleCounties": false
          },
          {
            "zip": "76119",
            "population": 42761,
            "spansMultipleCounties": false
          },
          {
            "zip": "76120",
            "population": 15283,
            "spansMultipleCounties": false
          },
          {
            "zip": "76123",
            "population": 29722,
            "spansMultipleCounties": false
          },
          {
            "zip": "76126",
            "population": 19395,
            "spansMultipleCounties": true
          },
          {
            "zip": "76129",
            "population": 2833,
            "spansMultipleCounties": false
          },
          {
            "zip": "76131",
            "population": 28374,
            "spansMultipleCounties": false
          },
          {
            "zip": "76132",
            "population": 24709,
            "spansMultipleCounties": false
          },
          {
            "zip": "76133",
            "population": 48394,
            "spansMultipleCounties": false
          },
          {
            "zip": "76134",
            "population": 23704,
            "spansMultipleCounties": false
          },
          {
            "zip": "76135",
            "population": 20684,
            "spansMultipleCounties": false
          },
          {
            "zip": "76137",
            "population": 54911,
            "spansMultipleCounties": false
          },
          {
            "zip": "76140",
            "population": 26340,
            "spansMultipleCounties": false
          },
          {
            "zip": "76148",
            "population": 23331,
            "spansMultipleCounties": false
          },
          {
            "zip": "76155",
            "population": 3115,
            "spansMultipleCounties": false
          },
          {
            "zip": "76164",
            "population": 16748,
            "spansMultipleCounties": false
          },
          {
            "zip": "76177",
            "population": 4891,
            "spansMultipleCounties": true
          },
          {
            "zip": "76179",
            "population": 48058,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Grand Prairie",
        "zips": [
          {
            "zip": "75054",
            "population": 5053,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Grapevine",
        "zips": [
          {
            "zip": "76051",
            "population": 46320,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Haltom City",
        "zips": [
          {
            "zip": "76117",
            "population": 30645,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Haslet",
        "zips": [
          {
            "zip": "76052",
            "population": 15995,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Hurst",
        "zips": [
          {
            "zip": "76053",
            "population": 28421,
            "spansMultipleCounties": false
          },
          {
            "zip": "76054",
            "population": 11764,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Keller",
        "zips": [
          {
            "zip": "76244",
            "population": 60388,
            "spansMultipleCounties": false
          },
          {
            "zip": "76248",
            "population": 34647,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Kennedale",
        "zips": [
          {
            "zip": "76060",
            "population": 6764,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Mansfield",
        "zips": [
          {
            "zip": "76063",
            "population": 61361,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Naval Air Station Jrb",
        "zips": [
          {
            "zip": "76127",
            "population": 2003,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "North Richland Hills",
        "zips": [
          {
            "zip": "76180",
            "population": 33444,
            "spansMultipleCounties": false
          },
          {
            "zip": "76182",
            "population": 28209,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Southlake",
        "zips": [
          {
            "zip": "76092",
            "population": 26669,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  },
  {
    "county": "Johnson",
    "cities": [
      {
        "name": "Alvarado",
        "zips": [
          {
            "zip": "76009",
            "population": 19759,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Burleson",
        "zips": [
          {
            "zip": "76028",
            "population": 59744,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Cleburne",
        "zips": [
          {
            "zip": "76031",
            "population": 17759,
            "spansMultipleCounties": false
          },
          {
            "zip": "76033",
            "population": 24819,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Cresson",
        "zips": [
          {
            "zip": "76035",
            "population": 1622,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Godley",
        "zips": [
          {
            "zip": "76044",
            "population": 3866,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Grandview",
        "zips": [
          {
            "zip": "76050",
            "population": 5875,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Joshua",
        "zips": [
          {
            "zip": "76058",
            "population": 17123,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Keene",
        "zips": [
          {
            "zip": "76059",
            "population": 4881,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Lillian",
        "zips": [
          {
            "zip": "76061",
            "population": 152,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Rio Vista",
        "zips": [
          {
            "zip": "76093",
            "population": 2095,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Venus",
        "zips": [
          {
            "zip": "76084",
            "population": 8327,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  },
  {
    "county": "Parker",
    "cities": [
      {
        "name": "Aledo",
        "zips": [
          {
            "zip": "76008",
            "population": 13602,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Millsap",
        "zips": [
          {
            "zip": "76066",
            "population": 3142,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Poolville",
        "zips": [
          {
            "zip": "76487",
            "population": 2507,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Springtown",
        "zips": [
          {
            "zip": "76082",
            "population": 17748,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Weatherford",
        "zips": [
          {
            "zip": "76085",
            "population": 8787,
            "spansMultipleCounties": false
          },
          {
            "zip": "76086",
            "population": 20196,
            "spansMultipleCounties": false
          },
          {
            "zip": "76087",
            "population": 24746,
            "spansMultipleCounties": true
          },
          {
            "zip": "76088",
            "population": 11499,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Whitt",
        "zips": [
          {
            "zip": "76490",
            "population": 91,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Hood",
    "cities": [
      {
        "name": "Granbury",
        "zips": [
          {
            "zip": "76048",
            "population": 21989,
            "spansMultipleCounties": true
          },
          {
            "zip": "76049",
            "population": 25130,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Lipan",
        "zips": [
          {
            "zip": "76462",
            "population": 2982,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Tolar",
        "zips": [
          {
            "zip": "76476",
            "population": 2637,
            "spansMultipleCounties": false
          }
        ]
      }
    ]
  },
  {
    "county": "Wise",
    "cities": [
      {
        "name": "Alvord",
        "zips": [
          {
            "zip": "76225",
            "population": 3156,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Boyd",
        "zips": [
          {
            "zip": "76023",
            "population": 5832,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Bridgeport",
        "zips": [
          {
            "zip": "76426",
            "population": 11302,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Chico",
        "zips": [
          {
            "zip": "76431",
            "population": 3384,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Decatur",
        "zips": [
          {
            "zip": "76234",
            "population": 15587,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Newark",
        "zips": [
          {
            "zip": "76071",
            "population": 3320,
            "spansMultipleCounties": true
          }
        ]
      },
      {
        "name": "Paradise",
        "zips": [
          {
            "zip": "76073",
            "population": 5327,
            "spansMultipleCounties": false
          }
        ]
      },
      {
        "name": "Rhome",
        "zips": [
          {
            "zip": "76078",
            "population": 8572,
            "spansMultipleCounties": true
          }
        ]
      }
    ]
  }
];
