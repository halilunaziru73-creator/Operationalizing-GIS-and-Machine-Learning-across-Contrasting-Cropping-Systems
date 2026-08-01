// Reference list: id (anchor), inline label, full citation text, optional url
const REFS = [
  { id: "aranha2026", label: "Aranha, 2026", text: "Aranha, J.T.M., 2026. UTAD Lecture and Practical Notes: Remote Sensing and GIS Applications in Environmental and Viticultural Analysis. University of Tr\u00e1s-os-Montes e Alto Douro (UTAD), Portugal. [Unpublished course material]" },
  { id: "benelli2023", label: "Benelli et al., 2023", text: "Benelli, G., Ricciardi, R., Cosci, F., Iodice, A., Ladurner, E., Savino, F., Lucchi, A., 2023. Sex pheromone aerosol emitters for Lobesia botrana mating disruption in Italian vineyards. Insects, 14(3), 270.", url: "https://doi.org/10.3390/insects14030270" },
  { id: "breiman2001", label: "Breiman, 2001", text: "Breiman, L., 2001. Random forests. Machine Learning, 45(1), 5\u201332.", url: "https://doi.org/10.1023/A:1010933404324" },
  { id: "burglewski2024", label: "Burglewski et al., 2024", text: "Burglewski, N., Srinivasagan, S., Ketterings, Q., van Aardt, J., 2024. Spatial and spectral dependencies of maize yield estimation using remote sensing. Sensors, 24(12), 3958.", url: "https://doi.org/10.3390/s24123958" },
  { id: "chavez1988", label: "Chavez, 1988", text: "Chavez, P.S., 1988. An improved dark-object subtraction technique for atmospheric scattering correction of multispectral data. Remote Sensing of Environment, 24(3), 459\u2013479." },
  { id: "chavez1996", label: "Chavez, 1996", text: "Chavez, P.S., 1996. Image-based atmospheric corrections \u2014 revisited and improved. Photogrammetric Engineering & Remote Sensing, 62(9), 1025\u20131036." },
  { id: "chenguestrin2016", label: "Chen and Guestrin, 2016", text: "Chen, T., Guestrin, C., 2016. XGBoost: A scalable tree boosting system. In: Proceedings of the 22nd ACM SIGKDD International Conference on Knowledge Discovery and Data Mining, 785\u2013794.", url: "https://doi.org/10.1145/2939672.2939785" },
  { id: "chlingaryan2018", label: "Chlingaryan et al., 2018", text: "Chlingaryan, A., Sukkarieh, S., Whelan, B., 2018. Machine learning approaches for crop yield prediction and nitrogen status estimation in precision agriculture: a review. Computers and Electronics in Agriculture, 151, 61\u201369.", url: "https://doi.org/10.1016/j.compag.2018.05.012" },
  { id: "chuvieco2020", label: "Chuvieco, 2020", text: "Chuvieco, E., 2020. Fundamentals of Satellite Remote Sensing (3rd ed.). CRC Press." },
  { id: "fraga2018", label: "Fraga et al., 2018", text: "Fraga, H., Costa, R., Santos, J.A., 2018. Modelling the terroir of the Douro Demarcated Region, Portugal. E3S Web of Conferences, 50, 02009.", url: "https://doi.org/10.1051/e3sconf/20185002009" },
  { id: "friedman2001", label: "Friedman, 2001", text: "Friedman, J.H., 2001. Greedy function approximation: a gradient boosting machine. Annals of Statistics, 29(5), 1189\u20131232.", url: "https://doi.org/10.1214/aos/1013203451" },
  { id: "hengl2007", label: "Hengl et al., 2007", text: "Hengl, T., Heuvelink, G.B.M., Rossiter, D.G., 2007. About regression-kriging: from equations to case studies. Computers & Geosciences, 33(10), 1301\u20131315.", url: "https://doi.org/10.1016/j.cageo.2007.05.001" },
  { id: "jensen2015", label: "Jensen, 2015", text: "Jensen, J.R., 2015. Introductory Digital Image Processing: A Remote Sensing Perspective. Pearson." },
  { id: "liakos2018", label: "Liakos et al., 2018", text: "Liakos, K.G., Busato, P., Moshou, D., Pearson, S., Bochtis, D., 2018. Machine learning in agriculture: a review. Sensors, 18(8), 2674.", url: "https://doi.org/10.3390/s18082674" },
  { id: "lillesand2015", label: "Lillesand et al., 2015", text: "Lillesand, T., Kiefer, R.W., Chipman, J., 2015. Remote Sensing and Image Interpretation. Wiley." },
  { id: "matese2015a", label: "Matese and Di Gennaro, 2015", text: "Matese, A., Di Gennaro, S.F., 2015. Technology in precision viticulture: a state of the art review. International Journal of Wine Research, 7, 69\u201381.", url: "https://doi.org/10.2147/IJWR.S69405" },
  { id: "matese2015b", label: "Matese et al., 2015", text: "Matese, A., Toscano, P., Di Gennaro, S.F., Genesio, L., Vaccari, F.P., Primicerio, J., Belli, C., Zaldei, A., Bianconi, R., Gioli, B., 2015. Intercomparison of UAV, aircraft and satellite remote sensing platforms for precision viticulture. Remote Sensing, 7(3), 2971\u20132990.", url: "https://doi.org/10.3390/rs70302971" },
  { id: "moran1950", label: "Moran, 1950", text: "Moran, P.A.P., 1950. Notes on continuous stochastic phenomena. Biometrika, 37(1\u20132), 17\u201323.", url: "https://doi.org/10.1093/biomet/37.1-2.17" },
  { id: "nasa2023", label: "NASA, 2023", text: "NASA, 2023. Landsat Missions Overview.", url: "https://www.usgs.gov/landsat-missions" },
  { id: "ricciardi2024", label: "Ricciardi et al., 2024", text: "Ricciardi, R., De Fazi, L., D\u2019Anna, G., Savino, F., Ladurner, E., Iodice, A., Benelli, G., Lucchi, A., 2024. Simultaneous mating disruption of two moth pests of the vineyard (Lobesia botrana and Cryptoblabes gnidiella) through a biodegradable sex pheromone dispenser. Environmental Science and Pollution Research.", url: "https://doi.org/10.1007/s11356-024-33980-w" },
  { id: "rouse1974", label: "Rouse et al., 1974", text: "Rouse, J.W., Haas, R.H., Schell, J.A., Deering, D.W., 1974. Monitoring vegetation systems in the Great Plains with ERTS. NASA Special Publication SP-351, 309\u2013317." },
  { id: "roy2014", label: "Roy et al., 2014", text: "Roy, D.P., Wulder, M.A., Loveland, T.R., et al., 2014. Landsat-8: Science and product vision for terrestrial global change research. Remote Sensing of Environment, 145, 154\u2013172." },
  { id: "sekulic2020", label: "Sekuli\u0107 et al., 2020", text: "Sekuli\u0107, A., Kilibarda, M., Heuvelink, G.B.M., Nikoli\u0107, M., Bajat, B., 2020. Random forest spatial interpolation. Remote Sensing, 12(10), 1687.", url: "https://doi.org/10.3390/rs12101687" },
  { id: "shaddad2016", label: "Shaddad et al., 2016", text: "Shaddad, S.M., Madrau, S., Castrignan\u00f2, A., Mouazen, A.M., 2016. Data fusion techniques for delineation of site-specific management zones in a field in UK. Precision Agriculture, 17(2), 200\u2013217.", url: "https://doi.org/10.1007/s11119-015-9417-6" },
  { id: "trangmar1985", label: "Trangmar et al., 1985", text: "Trangmar, B.B., Yost, R.S., Uehara, G., 1985. Applications of geostatistics to spatial studies of soil properties. Advances in Agronomy, 38, 45\u201394.", url: "https://doi.org/10.1016/S0065-2113(08)60673-2" },
  { id: "usgs2023", label: "USGS, 2023", text: "USGS, 2023. Landsat 8 Data Users Handbook. United States Geological Survey." },
  { id: "webster2001", label: "Webster and Oliver, 2001", text: "Webster, R., Oliver, M.A., 2001. Geostatistics for Environmental Scientists. John Wiley & Sons." },
  { id: "wong2017", label: "Wong, 2017", text: "Wong, D.W.S., 2017. Interpolation: Inverse-distance weighting. In: International Encyclopedia of Geography: People, the Earth, Environment and Technology.", url: "https://doi.org/10.1002/9781118786352.wbieg0066" },
];

const REF_BY_ID = {};
REFS.forEach(r => REF_BY_ID[r.id] = r);

module.exports = { REFS, REF_BY_ID };
