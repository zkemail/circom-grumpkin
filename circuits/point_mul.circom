pragma circom 2.0.0;
// include "../node_modules/circom-ecdsa/circuits/secp256k1.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";
include "./point_add.circom";

template PointDouble() {
    signal input a[2];
    signal output out[2];
    
    signal y2_inv <--  1/(2*a[1]);
    2*a[1] * y2_inv === 1;
    signal x_squared <== a[0] * a[0];
    signal lambda <== 3 * x_squared * y2_inv;
    out[0] <== lambda * lambda - 2*a[0];
    signal gamma <== a[1] - lambda * a[0];
    out[1] <== - lambda * out[0] - gamma;
}

template PointScalarMul(n) {
    signal input a[2];
    signal input scalar;
    signal output out[2];

    signal scalar_bits[n] <== Num2Bits(n)(scalar);

    signal sum[n][2];
    signal doubled[n+1][2];
    signal result[n+1][2];
    doubled[0][0] <== a[0];
    doubled[0][1] <== a[1];
    result[0][0] <== 0;
    result[0][1] <== 1;
    for(var i=0; i<n; i++) {
        sum[i] <== PointAdd()(result[i], doubled[i]);
        doubled[i+1] <== PointDouble()(doubled[i]);
        result[i+1][0] <== scalar_bits[i]*(sum[i][0] - result[i][0]) + result[i][0];
        result[i+1][1] <== scalar_bits[i]*(sum[i][1] - result[i][1]) + result[i][1];
    }
    out[0] <== result[n][0];
    out[1] <== result[n][1];
}