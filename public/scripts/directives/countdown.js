angular
  .module('tweetstockr')
  .directive('countdown', ['$timeout', countdown]);

  function countdown(timer) {

    return {
      restrict: 'A',
      link: function(scope, iElement, attributes) {
        var context = iElement[0].getContext('2d');
        var x = iElement[0].width / 2;
        var y = iElement[0].height / 2;
        var radius = 90;
        var startAngle = 0 * Math.PI;
        var endAngle;
        var counterClockwise = false;
        var strokeColor;

        function getColor(huh) {
          if (huh <= 49) {
            strokeColor = '#f33155';
          } else if (huh <= 74) {
            strokeColor = '#F4D35E';
          } else strokeColor = '#43c8c0';
          return strokeColor;
        }

        var getDeg = function(inPerc) {
          context.clearRect(0, 0, x*2, y*2);
          var aPerc = (inPerc * 0.02);
          endAngle = aPerc * Math.PI;
          context.beginPath();
          context.arc(x, y, radius, startAngle, endAngle, counterClockwise);
          context.lineWidth = 15;
          context.strokeStyle = getColor(inPerc);
          context.stroke();
        }

        scope.$watch('nextUpdatePerc', function(){
          timer(getDeg(scope.nextUpdatePerc), 1);
        });
      }
    }

  }
