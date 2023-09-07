pragma circom 2.0.0;
// include "../node_modules/circom-ecdsa/circuits/secp256k1.circom";
include "../node_modules/circomlib/circuits/comparators.circom";
include "../node_modules/circomlib/circuits/bitify.circom";


template PointDouble() {
    signal input a[2];
    signal output out[2];
    
    signal y_inv = 1/a[1];
    a[1] * y_inv === 1;
    signal lambda <== 3 * a[0] * a[0] * y_inv;
    out[0] <== lambda * lambda - 2*a[0];
    signal gamma <== a[1] - lambda * a[0];
    out[1] <== - lambda * out[0] - gamma;
}

// template PointScalarMul(n) {
//     signal input a[2];
//     signal input scalar;
//     signal output out[2];

//     signal scalar_bits[n] <== Num2Bits(n)(scalar);

//     signal sum[n+1][2];
//     signal doubled[n+1][2];
//     sum[0][0] <== scalar[0] +;
//     sum[0]
// }