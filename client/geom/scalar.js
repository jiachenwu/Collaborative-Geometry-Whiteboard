let Scalar = function() { let self = {}; return self; }

Scalar.sq = function(a) { return a*a; }
Scalar.lerp = function(a,b,t) { return a + t*(b-a); }
Scalar.lerpAdjusted = function(a,A,b,B,t) { return lerp(A,B,(t-a)/(b-a)); }

Scalar.isEqual = function(a,b,eps) { 
    return a+eps>b && a-eps<b; 
}

export{Scalar};