# D3 Exercise
Visualization for the City of Calgary 2016 Census data

1) Using D3, create a page that reads the 2016 census data and creates a bar graph with it.
Put population on the Y axis (that's the RES_CNT column, resident count), and put these five
communities on the X axis: EDGEMONT, ACADIA, BANFF TRAIL, CRESCENT HEIGHTS,
PANORAMA HILLS.

2) Using D3, create a page that reads the 2016 census data and creates two visualizations.
The first visualization should aggregate the resident count based on the city sector column. In
other words, total up the residents for each of the nine sectors in the sector column, and show
the totals for each sector.

The second visualization should aggregate the resident count based on the community
structure (COMM_STRUCTURE) column.

The page should only display one of the two visualizations at a time. Include some simple
user interface controls to switch between the two visualizations.
You can choose any type of graph for the two

# Steps to run example

After cloning the repository run `npm-install` to install the code examples dependencies.
When the installation is complete run `npm build` and `npm start`.

Navigate to your browser at `localhost:8080`. This will display the first step to the code example.
If you want to see the second part to the code example you can either use the interface or manually navigate
to the URL `localhost:8080/demo2.html`.
