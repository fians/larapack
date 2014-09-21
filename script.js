
;(function(w, $) {
    'use strict';

    var background  = $('#leadBackground');
    var bgWidth     = background.width();
    var bgHeight    = background.height() + 30;

    var gridPoint   = 50;
    var gridWidth   = parseInt(bgWidth/gridPoint);
    var gridHeight  = parseInt(bgHeight/gridPoint);

    var paper = new Raphael('leadBackground', bgWidth, bgHeight);

    var pathAttr = {
        'stroke-width': 5, 
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
        'stroke': '#fff', 
        'opacity': 0.2
    };

    /**
     * Get Random number
     */
    function randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Define direction of origin string
     */
    function pickDirection(type) {

        var x       = ['left', 'right'];
        var y       = ['top', 'bottom'];
        var rand    = randomNumber(0, 1);

        switch(type) {
            case 'top':     return x[rand];
            case 'right':   return y[rand];
            case 'bottom':  return x[rand];
            case 'left':    return y[rand];
        }
    }

    /**
     * Randomly pick element origin
     */
    function pickOrigin() {

        // Define initial path
        var path = 'M';

        var maxWidth = (gridWidth + 1) * 50;
        var maxHeight = (gridHeight + 1) * 50;
        var posName = ['top', 'right', 'bottom', 'left'];

        // Define starting point
        var start = {
            x: 0,
            y: 0,
            from: posName[randomNumber(0, 3)]
        };

        switch (start.from) {
            case 'top':
                start.x = randomNumber(0, (gridWidth+1))*gridPoint;
                start.to = 'bottom';
                break;
            case 'right':
                start.x = maxWidth;
                start.y = randomNumber(0, (gridHeight+1))*gridPoint;
                start.to = 'left';
                break;
            case 'bottom':
                start.x = randomNumber(0, (gridWidth+1))*gridPoint;
                start.y = maxHeight;
                start.to = 'top';
                break;
            case 'left':
                start.y = randomNumber(0, (gridHeight+1))*gridPoint;
                start.to = 'right';
                break;
        }

        return start;
    }

    /**
     * Set next line point based on previous coordinate
     */
    function setLinePoint(x, y, direction, length) {

        var realLength = length * gridPoint;

        switch (direction) {
            case 'top':
                    y -= realLength;
                break;
            case 'right':
                    x += realLength;
                break;
            case 'bottom':
                    y += realLength;
                break;
            case 'left':
                    x -= realLength;
                break;
        }

        return {
            x: x,
            y: y,
            length: length
        };
    }

    function drawLine(line) {

        line = line || null;

        if (line === null) {

            var origin = pickOrigin();

            line = {
                origin: {
                    x: origin.x,
                    y: origin.y
                },
                points: [{
                    x: origin.x,
                    y: origin.y,
                    length: 0,
                }],
                status: origin.to
            };
        }

        var length      = randomNumber(1, 3);
        var lastPoint   = line.points[line.points.length-1];
        var newPoint    = setLinePoint(lastPoint.x, lastPoint.y, line.status, length);

        line.points.push(newPoint);
        line.status = pickDirection(line.status);

        if (
            newPoint.x < 0 || 
            newPoint.y < 0 || 
            newPoint.x > bgWidth || 
            newPoint.y > bgHeight) {
            return line;
        }

        return drawLine(line);
    }

    function moveLine(pathPoints, pathString, startPoint, element) {

        element     = element || null;
        pathString  = pathString || null;
        startPoint  = startPoint || 1;

        // Create new element
        if (element === null || pathString === null) {
            pathString = 'M'+pathPoints[0].x+' '+pathPoints[0].y;
            element = paper.path(pathString).attr(pathAttr);
        }

        var point = pathPoints[startPoint];

        if (!point) {
            return element.animate({opacity: 0}, 500, function() {
                element.remove();
                $(document).trigger('drawLine');
            });
        }

        // Add path string
        pathString += 'L'+point.x+' '+point.y;

        // Animate it
        element.animate({path: pathString}, point.length*500, function() {
            return moveLine(pathPoints, pathString, startPoint+1, element);
        });

    }

    $(document).on('ready', function() {

        for (var a = 0; a < 5; a++) {
            moveLine(drawLine().points);
        }

    });

    $(document).on('drawLine', function() {
        moveLine(drawLine().points);
    });

})(window, jQuery);