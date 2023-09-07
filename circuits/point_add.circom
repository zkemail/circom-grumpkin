pragma circom 2.0.0;
// include "../node_modules/circom-ecdsa/circuits/secp256k1.circom";
include "../node_modules/circomlib/circuits/comparators.circom";

template PointAdd() {
    signal input a[2];
    signal input b[2];
    signal output out[2];
    
    component is_x_equal = IsEqual();
    is_x_equal.in[0] <== a[0];
    is_x_equal.in[1] <== b[0];
    is_x_equal.out === 0;

    signal x_sub <== a[0] - b[0];
    signal x_sub_inv <-- 1/x_sub;
    x_sub * x_sub_inv === 1;
    signal lambda <== (a[1] - b[1]) * x_sub_inv;
    out[0] <== lambda * lambda - a[0] - b[0];
    signal cross0 <== b[1] * a[0];
    signal cross1 <== cross0 - a[1] * b[0];
    signal gamma <== cross1 * x_sub_inv;
    out[1] <== - lambda * out[0] - gamma;
}

// template PointAdd() {
//     signal input a[2][4];
//     signal input b[2][4];
//     signal output out[2][4];

//     component add_unequal = Secp256k1AddUnequal(64, 4);
//     for (var i = 0; i < 4; i ++) {
//         add_unequal.a[0][i] <== a[0][i];
//         add_unequal.a[1][i] <== a[1][i];
//         add_unequal.b[0][i] <== b[0][i];
//         add_unequal.b[1][i] <== b[1][i];
//     }

//     for (var i = 0; i < 4; i ++) {
//         out[0][i] <== add_unequal.out[0][i];
//         out[1][i] <== add_unequal.out[1][i];
//     }
// }
