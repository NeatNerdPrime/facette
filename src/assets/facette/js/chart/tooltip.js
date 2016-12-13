chart.fn.drawTooltip = function() {
    var $$ = this,
        container = d3.select($$.config.bindTo);

    // Remove previous tooltips if any
    container.selectAll('.chart-tooltip').remove();

    $$.tooltipGroup = container.append('div')
        .attr('class', 'chart-tooltip')
        .style('display', 'none');

    var table = $$.tooltipGroup.append('table');

    $$.tooltipDate = table.append('thead').append('tr').append('th')
        .attr('class', 'chart-tooltip-date')
        .attr('colspan', 2);

    $$.tooltipBody = table.append('tbody');

    $$.tooltipEnabled = false;
};

chart.fn.toggleTooltip = function(state) {
    var $$ = this;

    $$.tooltipEnabled = state;
    this.tooltipGroup.style('display', $$.tooltipEnabled ? 'block' : 'none');
};

chart.fn.updateTooltip = function(data) {
    var $$ = this;

    $$.tooltipDate.text($$.config.tooltip.date.format ? $$.config.tooltip.date.format(data.date) : data.date);
    $$.tooltipBody.selectAll('*').remove();

    data.values.forEach(function(entry, idx) {
        var row = $$.tooltipBody.append('tr'),
            cell = row.append('th');

        cell.append('span')
            .attr('class', 'chart-tooltip-color')
            .style('background-color', $$.config.series[idx].color);

        cell.append('span')
            .text(entry.name);

        var isNull = entry.value === undefined || entry.value === null;

        row.append('td')
            .classed('null', isNull)
            .text(isNull ? 'null' : $$.config.axis.y.tick.format(entry.value[1]));
    });
};
