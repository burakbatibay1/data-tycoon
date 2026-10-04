const MISSIONS = {

    salesMystery: {

        id: "CASE-001",

        title: "The Sales Mystery",

        difficulty: 1,

        brief:
            "Sales fell last month. Which region is driving the decline?",

        mentor:
            "Start by comparing how much sales changed in each region.",

        regions: [

            {
                name: "Istanbul",
                august: 840,
                september: 806
            },

            {
                name: "Ankara",
                august: 420,
                september: 407
            },

            {
                name: "Izmir",
                august: 390,
                september: 269
            },

            {
                name: "Bursa",
                august: 280,
                september: 286
            }

        ],

        correctAnswer:
            "Izmir",

        reward: {

            xp: 100,

            skills: {

                dataLiteracy: 8,

                dataExploration: 10,

                businessThinking: 4

            }

        }

    }

};