an example with colors by groups

---

an [ES2015](https://babeljs.io/docs/learn-es2015/) [**d3v4**](https://github.com/d3/d3/blob/master/API.md) fork of the bl.ock [distance-limited Voronoi Interaction III](http://bl.ocks.org/Kcnarf/4de291d8b2d1e6501990540d87bc1baf) from [Kcnarf](http://bl.ocks.org/Kcnarf)

this iteration offers a few improvements and developer comforts:

- convert to [ES2015](https://babeljs.io/docs/learn-es2015/)
- lint, convert to [Airbnb style](https://github.com/airbnb/javascript)
- store data as json
- name data file data.json
- convert to [**d3v4**](https://github.com/d3/d3/blob/master/API.md)
- remove [pym.js](http://blog.apps.npr.org/pym.js/) dependency
- use [d3-tip](https://github.com/VACLab/d3-tip) tooltips
- remove [jQuery](https://jquery.com/) dependency
- abstract out dataset-specific variable names into configuration block
- derive color domain from the data

in a future iteration, I'd like to:

- hide [Voronoi](https://en.wikipedia.org/wiki/Georgy_Voronoy) paths
- add arrow to tooltip div
- make tooltip snap to point
- package this resuable chart as an npm module

---

#### Original `README.md`

---

This [block](http://bl.ocks.org/Kcnarf/4de291d8b2d1e6501990540d87bc1baf) is based on [Step 3 - Voronoi Scatterplot - Tooltip attached to circle](http://bl.ocks.org/nbremer/c0ffc07b23b1c556a66b) from [@NadiehBremer ](https://twitter.com/NadiehBremer)

The Voronoi technics (used to improve interactive experience) is something I like. But I'm quite confused when the mouse is far away from points/subjectsOfMatter. In the original example, this situation arises in the viz's top-left and bottom-right corners.

This block attempts to overcome this issue by:

 * still using the Voronoi partition to identifiy the closest point/subjectOfMmatter when they are close to each others
 * and, checking if the distance from the point to the mouse is close enought (max distance checking)

For the sake of illustration, interactive areas appear in (very) light blue. Interactive zones would not be rendered in the final viz.

The implementation in this [block](http://bl.ocks.org/Kcnarf/4de291d8b2d1e6501990540d87bc1baf) uses a plugin I made (see __[d3-distanceLimitedVoronoi](https://github.com/Kcnarf/d3-distanceLimitedVoronoi) Github project__) that computes the adequate interactive area around each point. The adequate path is: voronoï-cell INTERSECT max-distance-from-point. Others ways could be:

 
 * clip each Voronoi cell with a circle shape (cf. this [block](http://bl.ocks.org/Kcnarf/48c9ec6eb80e3eafdb3250f4b6d6380c))
 * use JS to determine if the pointer is close enought to display the tooltip (cf. this [block](http://bl.ocks.org/Kcnarf/c6e9c98a55287e6cd03aae7080b9ec90))

This third implementation of distance-limited voronoi cell is simpler than the 2 others because:

 * compared to the clipPath way, it doesn't requires extra clipPathes (dedicated definition, and bindings to each cell)
 * compared to the JS-based way, mouse interaction is easier (only mouseenter and mouseout, no mousemoved), and less intensive (no mousemove); nevertheless, it comes with the cost of computing the adequate path of each cell.
 
 
#### Acknowledgments to:
 * <a href='https://d3js.org/'>D3.js</a> (v3)
 * <a href='http://bl.ocks.org'>blockbuilder.org</a>
 * [Step 3 - Voronoi Scatterplot - Tooltip attached to circle](http://bl.ocks.org/nbremer/c0ffc07b23b1c556a66b)

