chart.fn.drawArea = function() {
    var $$ = this;

    var areaTop = $$.titleGroup ? $$.titleGroup.node().getBBox().height : 0,
        areaLeft = $$.yAxisGroup.node().getBBox().width;

    if ($$.yLegend) {
        areaLeft += $$.yLegend.node().getBBox().height + $$.config.padding / 2;
    }

    $$.area = d3.area()
        .x(function(a) { return $$.xScale(a.x); })
        .y0(function(a) { return $$.yScale(a.y0 || 0); })
        .y1(function(a) { return $$.yScale(a.y1); });

    $$.line = d3.line()
        .x(function(a) { return $$.xScale(a.x); })
        .y(function(a) { return $$.yScale(a.y1); });

    if ($$.areaGroup) {
        $$.areaGroup.remove();
    }

    $$.areaGroup = $$.mainGroup.insert('g', 'g.chart-axis')
        .attr('class', 'chart-area')
        .attr('transform', 'translate(' + areaLeft + ',' + areaTop + ')');

    // Draw Y axis grid lines
    var ticks = $$.yScale.ticks($$.config.axis.y.tick.count),
        xVal = $$.width - areaLeft - 2 * $$.config.padding;

    ticks.forEach(function(tick) {
        var yVal = $$.yScale(tick);

        $$.areaGroup.append('line')
            .attr('class', 'chart-grid')
            .attr('x1', 0)
            .attr('x2', xVal)
            .attr('y1', yVal)
            .attr('y2', yVal);
    });

    // Draw X axis cursor line
    $$.cursorLine = $$.areaGroup.append('line')
        .attr('class', 'chart-grid chart-cursor')
        .attr('x1', 0)
        .attr('x2', 0)
        .attr('y1', 0)
        .attr('y2', $$.height - areaTop - 2 * $$.config.padding)
        .style('display', 'none');
};

chart.fn.toggleCursor = function(time) {
    var $$ = this,
        domain = $$.xScale.domain();

    if (!time || time < domain[0] || time > domain[1]) {
        $$.cursorLine.style('display', 'none');
        return;
    }

    var x = $$.xScale(time);

    $$.cursorLine
        .attr('x1', x)
        .attr('x2', x)
        .style('display', 'block');
};
