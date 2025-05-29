const width = 800;
const height = 600;

const svg = d3.select("#network")
  .attr("width", width)
  .attr("height", height);


Promise.all([
  d3.json("network_nodes.json"),
  d3.json("network_edges.json")
]).then(([nodes, edges]) => {

  // DEBUG: check keys
  console.log("Nodes:", nodes);
  console.log("Edges:", edges);

  // Remove trailing whitespace from keys for safer access
  nodes.forEach(d => {
    d.id = d["ID "]; // Fix for 'ID '
    d.label = d.Label; // assuming 'Label' is OK
  });

  edges.forEach(d => {
    d.source = d.Source;
    d.target = d.Target;
  });

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(edges).id(d => d.id).distance(100))
    .force("charge", d3.forceManyBody().strength(-300))
    .force("center", d3.forceCenter(width / 2, height / 2));

  const link = svg.selectAll("line")
    .data(edges)
    .enter().append("line")
    .attr("stroke", "#aaa");

  const node = svg.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
    .attr("r", 6)
    .attr("fill", "#69b3a2")
    .call(drag(simulation));

  const label = svg.selectAll("text")
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
