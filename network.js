const width = 800;
const height = 600;

// Create SVG and zoom group
const svg = d3.select("#network")
  .attr("width", width)
  .attr("height", height);

// Append zoom group first
const zoomGroup = svg.append("g");

// Add background rectangle inside zoom group (so it scales with zoom)
zoomGroup.append("rect")
  .attr("width", width)
  .attr("height", height)
  .attr("fill", "#fff3e6");  // warm peach background

// Setup zoom slider
const zoomSlider = document.getElementById("zoom-slider");
let currentZoom = 1;

zoomSlider.addEventListener("input", function () {
  currentZoom = parseFloat(this.value);
  zoomGroup.attr("transform", `scale(${currentZoom})`);
});

Promise.all([
  d3.json("network_nodes.json"),
  d3.json("network_edges.json")
]).then(([nodes, edges]) => {
  // Clean node and edge data
  nodes.forEach(d => {
    d.id = d["ID "];
    d.label = d.Label;
    d.gender = d["Gender "];
  });

  edges.forEach(d => {
    d.source = d.Source;
    d.target = d.Target;
    d.Weight = +d.Weight;  // ensure it's numeric
  });

  // Gender-based color scale
  const genderColor = d3.scaleOrdinal()
    .domain(["F", "NC", "nd"])
    .range(["#f48fb1", "#81d4fa", "#cfd8dc"]);

  // Stroke width scale for edge weights
  const weightScale = d3.scaleLinear()
    .domain([1, 3])
    .range([1.5, 3.5]);

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = zoomGroup.selectAll("line")
    .data(edges)
    .enter().append("line")
    .attr("stroke", "#aaa")
    .attr("stroke-width", d => weightScale(d.Weight));

  const node = zoomGroup.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 6)
    .attr("fill", d => genderColor(d.gender))
    .call(drag(simulation));

  const label = zoomGroup.selectAll("text")
    .data(nodes)
    .enter().append("text")
    .text(d => d.label)
    .attr("font-size", 10)
    .attr("dx", 8)
    .attr("dy", "0.35em");

  simulation.on("tick", () => {
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    node
      .attr("cx", d => d.x)
      .attr("cy", d => d.y);

    label
      .attr("x", d => d.x)
      .attr("y", d => d.y);
  });

  function drag(simulation) {
    return d3.drag()
      .on("start", event => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on("drag", event => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
      })
      .on("end", event => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });
  }
});
