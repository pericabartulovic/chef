Fraction = function (_Fraction) {
  function Fraction(_x, _x2) {
    return _Fraction.apply(this, arguments);
  }

  Fraction.toString = function () {
    return _Fraction.toString();
  };

  return Fraction;
}(function (numerator, denominator) {
  /* double argument invocation */
  if (typeof numerator !== 'undefined' && denominator) {
    if (typeof numerator === 'number' && typeof denominator === 'number') {
      this.numerator = numerator;
      this.denominator = denominator;
    } else if (typeof numerator === 'string' && typeof denominator === 'string') {
      // what are they?
      // hmm....
      // assume they are ints?
      this.numerator = parseInt(numerator);
      this.denominator = parseInt(denominator);
    }
    /* single-argument invocation */

  } else if (typeof denominator === 'undefined') {
    num = numerator; // swap variable names for legibility

    if (typeof num === 'number') {
      // just a straight number init
      this.numerator = num;
      this.denominator = 1;
    } else if (typeof num === 'string') {
      var a, b; // hold the first and second part of the fraction, e.g. a = '1' and b = '2/3' in 1 2/3
      // or a = '2/3' and b = undefined if we are just passed a single-part number

      var arr = num.split(' ');
      if (arr[0]) a = arr[0];
      if (arr[1]) b = arr[1];
      /* compound fraction e.g. 'A B/C' */
      //  if a is an integer ...

      if (a % 1 === 0 && b && b.match('/')) {
        return new Fraction(a).add(new Fraction(b));
      } else if (a && !b) {
        /* simple fraction e.g. 'A/B' */
        if (typeof a === 'string' && a.match('/')) {
          // it's not a whole number... it's actually a fraction without a whole part written
          var f = a.split('/');
          this.numerator = f[0];
          this.denominator = f[1];
          /* string floating point */
        } else if (typeof a === 'string' && a.match('\.')) {
          return new Fraction(parseFloat(a));
          /* whole number e.g. 'A' */
        } else {
          // just passed a whole number as a string
          this.numerator = parseInt(a);
          this.denominator = 1;
        }
      } else {
        return undefined; // could not parse
      }
    }
  }

  this.normalize();
});

Fraction.prototype.clone = function () {
  return new Fraction(this.numerator, this.denominator);
};
/* pretty-printer, converts fractions into whole numbers and fractions */


Fraction.prototype.toString = function () {
  if (this.denominator === 'NaN') return 'NaN';
  var wholepart = this.numerator / this.denominator > 0 ? Math.floor(this.numerator / this.denominator) : Math.ceil(this.numerator / this.denominator);
  var numerator = this.numerator % this.denominator;
  var denominator = this.denominator;
  var result = [];
  if (wholepart != 0) result.push(wholepart);
  if (numerator != 0) result.push((wholepart === 0 ? numerator : Math.abs(numerator)) + '/' + denominator);
  return result.length > 0 ? result.join(' ') : 0;
};
/* destructively rescale the fraction by some integral factor */


Fraction.prototype.rescale = function (factor) {
  this.numerator *= factor;
  this.denominator *= factor;
  return this;
};

Fraction.prototype.add = function (b) {
  var a = this.clone();

  if (b instanceof Fraction) {
    b = b.clone();
  } else {
    b = new Fraction(b);
  }

  td = a.denominator;
  a.rescale(b.denominator);
  b.rescale(td);
  a.numerator += b.numerator;
  return a.normalize();
};

Fraction.prototype.subtract = function (b) {
  var a = this.clone();

  if (b instanceof Fraction) {
    b = b.clone(); // we scale our argument destructively, so clone
  } else {
    b = new Fraction(b);
  }

  td = a.denominator;
  a.rescale(b.denominator);
  b.rescale(td);
  a.numerator -= b.numerator;
  return a.normalize();
};

Fraction.prototype.multiply = function (b) {
  var a = this.clone();

  if (b instanceof Fraction) {
    a.numerator *= b.numerator;
    a.denominator *= b.denominator;
  } else if (typeof b === 'number') {
    a.numerator *= b;
  } else {
    return a.multiply(new Fraction(b));
  }

  return a.normalize();
};

Fraction.prototype.divide = function (b) {
  var a = this.clone();

  if (b instanceof Fraction) {
    a.numerator *= b.denominator;
    a.denominator *= b.numerator;
  } else if (typeof b === 'number') {
    a.denominator *= b;
  } else {
    return a.divide(new Fraction(b));
  }

  return a.normalize();
};

Fraction.prototype.equals = function (b) {
  if (!(b instanceof Fraction)) {
    b = new Fraction(b);
  } // fractions that are equal should have equal normalized forms


  var a = this.clone().normalize();
  var b = b.clone().normalize();
  return a.numerator === b.numerator && a.denominator === b.denominator;
};
/* Utility functions */

/* Destructively normalize the fraction to its smallest representation. 
 * e.g. 4/16 -> 1/4, 14/28 -> 1/2, etc.
 * This is called after all math ops.
 */


Fraction.prototype.normalize = function () {
  var isFloat = function isFloat(n) {
    return typeof n === 'number' && (n > 0 && n % 1 > 0 && n % 1 < 1 || n < 0 && n % -1 < 0 && n % -1 > -1);
  };

  var roundToPlaces = function roundToPlaces(n, places) {
    if (!places) {
      return Math.round(n);
    } else {
      var scalar = Math.pow(10, places);
      return Math.round(n * scalar) / scalar;
    }
  };

  return function () {
    // XXX hackish.  Is there a better way to address this issue?
    //

    /* first check if we have decimals, and if we do eliminate them
     * multiply by the 10 ^ number of decimal places in the number
     * round the number to nine decimal places
     * to avoid js floating point funnies
     */
    if (isFloat(this.denominator)) {
      var rounded = roundToPlaces(this.denominator, 9);
      var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
      this.denominator = Math.round(this.denominator * scaleup); // this !!! should be a whole number
      //this.numerator *= scaleup;

      this.numerator *= scaleup;
    }

    if (isFloat(this.numerator)) {
      var rounded = roundToPlaces(this.numerator, 9);
      var scaleup = Math.pow(10, rounded.toString().split('.')[1].length);
      this.numerator = Math.round(this.numerator * scaleup); // this !!! should be a whole number
      //this.numerator *= scaleup;

      this.denominator *= scaleup;
    }

    var gcf = Fraction.gcf(this.numerator, this.denominator);
    this.numerator /= gcf;
    this.denominator /= gcf;

    if (this.numerator < 0 && this.denominator < 0 || this.numerator > 0 && this.denominator < 0) {
      this.numerator *= -1;
      this.denominator *= -1;
    }

    return this;
  };
}();
/* Takes two numbers and returns their greatest common factor.
 */


Fraction.gcf = function (a, b) {
  var common_factors = [];
  var fa = Fraction.primeFactors(a);
  var fb = Fraction.primeFactors(b); // for each factor in fa
  // if it's also in fb
  // put it into the common factors

  fa.forEach(function (factor) {
    var i = fb.indexOf(factor);

    if (i >= 0) {
      common_factors.push(factor);
      fb.splice(i, 1); // remove from fb
    }
  });
  if (common_factors.length === 0) return 1;

  var gcf = function () {
    var r = common_factors[0];
    var i;

    for (i = 1; i < common_factors.length; i++) {
      r = r * common_factors[i];
    }

    return r;
  }();

  return gcf;
}; // Adapted from: 
// http://www.btinternet.com/~se16/js/factor.htm


Fraction.primeFactors = function (n) {
  var num = Math.abs(n);
  var factors = [];
  var _factor = 2; // first potential prime factor

  while (_factor * _factor <= num) // should we keep looking for factors?
  {
    if (num % _factor === 0) // this is a factor
      {
        factors.push(_factor); // so keep it

        num = num / _factor; // and divide our search point by it
      } else {
      _factor++; // and increment
    }
  }

  if (num != 1) // If there is anything left at the end...
    {
      // ...this must be the last prime factor
      factors.push(num); //    so it too should be recorded
    }

  return factors; // Return the prime factors
};

module.exports.Fraction = Fraction;