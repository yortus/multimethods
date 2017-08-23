import {expect} from 'chai';
import {NormalPredicate} from 'multimethods/math/predicates';
import {EulerDiagram, EulerSet} from 'multimethods/math/sets';





describe('Constructing equivalent euler diagrams', () => {

    let tests = [
        ['∅', 'foo', 'bar', 'f{chars}', '*o'],
        ['**', '/f**', '/foo/*', '/foo', '/*o', '/foo'],
        ['a', 'b', 'c', 'd', 'e', 'f', '∅'],
        ['a', 'a', 'a', 'a', 'a', 'a'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*'],
        ['**', '*', '*/*', '**/*', '*/*', '*/*/*', '∅', 'a/b', 'a/*', '*/b/b'],
        ['*A*', '*B*', '*BB*'],
        ['*A*', '*BB*', '*B*'],
        ['*A*S*', '*B*', '*A*M*', '*B*M*'],
        ['*A*I*', '*B*', '*A*T*', '*B*I*T*'],
        ['*A*', '*B*', '*C*', '*B*C*D*'],
        ['*A*', '*B*', '*C*', '*B*C*D*', '*C*D*'],
        ['*A*', '*B*', '*B*C*', '*A*B*C*D*'],
        ['*A*', '*B*', '*C*', '*D*', '*E*', 'A', 'B', 'C', 'D', 'E'],
        [
            '*A*I*S*W*', '*B*W*', '*A*I*M*W*', '*W*', '*B*M*W*', '*A*J*M*S*', '*A*T*W*',
            '*A*E*S*T*W*', '*B*I*M*S*T*U*W*Y*Z*', '*A*B*X*Z*', '*A*B*M*W*X*Y*', '*D*E*Q*',
        ],
        [
            // Rarely overlapping, mostly superset/subset/disjoint (100 principal, 10 auxiliary)
            'a*', 'b*', 'c*', 'd*', 'e*', 'f*', 'g*', 'h*', 'i*', 'j*',
            'a/*', 'b/*', 'c/*', 'd/*', 'e/*', 'f/*', 'g/*', 'h/*', 'i/*', 'j/*',
            'a/a*', 'b/a*', 'c/a*', 'd/a*', 'e/a*', 'f/a*', 'g/a*', 'h/a*', 'i/a*', 'j/a*',
            'a/a*', 'a/b*', 'a/c*', 'a/d*', 'a/e*', 'a/f*', 'a/g*', 'a/h*', 'a/i*', 'a/j*',
            'a*/a*', 'b*/a*', 'c*/a*', 'd*/a*', 'e*/a*', 'f*/a*', 'g*/a*', 'h*/a*', 'i*/a*', 'j*/a*',
            'a/aa*', 'a/ab*', 'a/ac*', 'a/ad*', 'a/ae*', 'a/af*', 'a/ag*', 'a/ah*', 'a/ai*', 'a/aj*',
            'aa*', 'ab*', 'ac*', 'ad*', 'ae*', 'af*', 'ag*', 'ah*', 'ai*', 'aj*',
            'aa/*', 'ab/*', 'ac/*', 'ad/*', 'ae/*', 'af/*', 'ag/*', 'ah/*', 'ai/*', 'aj/*',
            'aa*/a*', 'ab*/a*', 'ac*/a*', 'ad*/a*', 'ae*/a*', 'af*/a*', 'ag*/a*', 'ah*/a*', 'ai*/a*', 'aj*/a*',
            'a/aaa*', 'a/aab*', 'a/aac*', 'a/aad*', 'a/aae*', 'a/aaf*', 'a/aag*', 'a/aah*', 'a/aai*', 'a/aaj*',
        ],
        [
            // Highly overlapping pathological case (20 principal, 190 auxiliary)
            '*.A*', '*.B*', '*.C*', '*.D*', '*.E*', '*.F*', '*.G*', '*.H*', '*.I*', '*.J*',
            '*.K*', '*.L*', '*.M*', '*.N*', '*.O*', '*.P*', '*.Q*', '*.R*', '*.S*', '*.T*',
        ],
        [
            // Highly overlapping pathological case (40 principal, 764 auxiliary)
            '*A*', '*B*', '*C*', '*D*', '*E*', '*F*', '*G*', '*H*',
            '*K*', '*L*', '*M*', '*N*', '*O*', '*P*', '*Q*', '*R*',
            '*0*', '*1*', '*2*', '*3*', '*4*', '*5*', '*6*', '*7*',
            '*@A*', '*@B*', '*@C*', '*@D*', '*@E*', '*@F*', '*@G*', '*@H*',
            '*A@*', '*B@*', '*C@*', '*D@*', '*E@*', '*F@*', '*G@*', '*H@*',
        ],
        [
            // Highly overlapping pathological case (80 principal, 2848 auxiliary)
            '*AA*', '*BB*', '*CC*', '*DD*', '*EE*', '*FF*', '*GG*', '*HH*',
            '*KK*', '*LL*', '*MM*', '*NN*', '*OO*', '*PP*', '*QQ*', '*RR*',
            '*00*', '*11*', '*22*', '*33*', '*44*', '*55*', '*66*', '*77*',
            '*A*Z*', '*B*Z*', '*C*Z*', '*D*Z*', '*E*Z*', '*F*Z*', '*G*Z*', '*H*Z*',
            '*K*Z*', '*L*Z*', '*M*Z*', '*N*Z*', '*O*Z*', '*P*Z*', '*Q*Z*', '*R*Z*',
            '*0*Z*', '*1*Z*', '*2*Z*', '*3*Z*', '*4*Z*', '*5*Z*', '*6*Z*', '*7*Z*',
            '*-*A*', '*-*B*', '*-*C*', '*-*D*', '*-*E*', '*-*F*', '*-*G*', '*-*H*',
            '*-*K*', '*-*L*', '*-*M*', '*-*N*', '*-*O*', '*-*P*', '*-*Q*', '*-*R*',
            '*-*0*', '*-*1*', '*-*2*', '*-*3*', '*-*4*', '*-*5*', '*-*6*', '*-*7*',
            '00*', '11*', '22*', '33*', '44*', '55*', '66*', '77*',
        ],
    ];

    let testsThatThrow = [
        [
            // Highly overlapping pathological case (100 principal, 4460 auxiliary)
            '*AA*', '*BB*', '*CC*', '*DD*', '*EE*', '*FF*', '*GG*', '*HH*', '*II*', '*JJ*',
            '*KK*', '*LL*', '*MM*', '*NN*', '*OO*', '*PP*', '*QQ*', '*RR*', '*SS*', '*TT*',
            '*00*', '*11*', '*22*', '*33*', '*44*', '*55*', '*66*', '*77*', '*88*', '*99*',
            '*A*Z*', '*B*Z*', '*C*Z*', '*D*Z*', '*E*Z*', '*F*Z*', '*G*Z*', '*H*Z*', '*I*Z*', '*J*Z*',
            '*K*Z*', '*L*Z*', '*M*Z*', '*N*Z*', '*O*Z*', '*P*Z*', '*Q*Z*', '*R*Z*', '*S*Z*', '*T*Z*',
            '*0*Z*', '*1*Z*', '*2*Z*', '*3*Z*', '*4*Z*', '*5*Z*', '*6*Z*', '*7*Z*', '*8*Z*', '*9*Z*',
            '*-*A*', '*-*B*', '*-*C*', '*-*D*', '*-*E*', '*-*F*', '*-*G*', '*-*H*', '*-*I*', '*-*J*',
            '*-*K*', '*-*L*', '*-*M*', '*-*N*', '*-*O*', '*-*P*', '*-*Q*', '*-*R*', '*-*S*', '*-*T*',
            '*-*0*', '*-*1*', '*-*2*', '*-*3*', '*-*4*', '*-*5*', '*-*6*', '*-*7*', '*-*8*', '*-*9*',
            '00*', '11*', '22*', '33*', '44*', '55*', '66*', '77*', '88*', '99*',
        ],
        [
            // Disjoint only, with no overlaps (676 principal, 0 auxiliary)
            'Aa', 'Ba', 'Ca', 'Da', 'Ea', 'Fa', 'Ga', 'Ha', 'Ia', 'Ja', 'Ka', 'La', 'Ma',
            'Na', 'Oa', 'Pa', 'Qa', 'Ra', 'Sa', 'Ta', 'Ua', 'Va', 'Wa', 'Xa', 'Ya', 'Za',
            'Ab', 'Bb', 'Cb', 'Db', 'Eb', 'Fb', 'Gb', 'Hb', 'Ib', 'Jb', 'Kb', 'Lb', 'Mb',
            'Nb', 'Ob', 'Pb', 'Qb', 'Rb', 'Sb', 'Tb', 'Ub', 'Vb', 'Wb', 'Xb', 'Yb', 'Zb',
            'Ac', 'Bc', 'Cc', 'Dc', 'Ec', 'Fc', 'Gc', 'Hc', 'Ic', 'Jc', 'Kc', 'Lc', 'Mc',
            'Nc', 'Oc', 'Pc', 'Qc', 'Rc', 'Sc', 'Tc', 'Uc', 'Vc', 'Wc', 'Xc', 'Yc', 'Zc',
            'Ad', 'Bd', 'Cd', 'Dd', 'Ed', 'Fd', 'Gd', 'Hd', 'Id', 'Jd', 'Kd', 'Ld', 'Md',
            'Nd', 'Od', 'Pd', 'Qd', 'Rd', 'Sd', 'Td', 'Ud', 'Vd', 'Wd', 'Xd', 'Yd', 'Zd',
            'Ae', 'Be', 'Ce', 'De', 'Ee', 'Fe', 'Ge', 'He', 'Ie', 'Je', 'Ke', 'Le', 'Me',
            'Ne', 'Oe', 'Pe', 'Qe', 'Re', 'Se', 'Te', 'Ue', 'Ve', 'We', 'Xe', 'Ye', 'Ze',
            'Af', 'Bf', 'Cf', 'Df', 'Ef', 'Ff', 'Gf', 'Hf', 'If', 'Jf', 'Kf', 'Lf', 'Mf',
            'Nf', 'Of', 'Pf', 'Qf', 'Rf', 'Sf', 'Tf', 'Uf', 'Vf', 'Wf', 'Xf', 'Yf', 'Zf',
            'Ag', 'Bg', 'Cg', 'Dg', 'Eg', 'Fg', 'Gg', 'Hg', 'Ig', 'Jg', 'Kg', 'Lg', 'Mg',
            'Ng', 'Og', 'Pg', 'Qg', 'Rg', 'Sg', 'Tg', 'Ug', 'Vg', 'Wg', 'Xg', 'Yg', 'Zg',
            'Ah', 'Bh', 'Ch', 'Dh', 'Eh', 'Fh', 'Gh', 'Hh', 'Ih', 'Jh', 'Kh', 'Lh', 'Mh',
            'Nh', 'Oh', 'Ph', 'Qh', 'Rh', 'Sh', 'Th', 'Uh', 'Vh', 'Wh', 'Xh', 'Yh', 'Zh',
            'Ai', 'Bi', 'Ci', 'Di', 'Ei', 'Fi', 'Gi', 'Hi', 'Ii', 'Ji', 'Ki', 'Li', 'Mi',
            'Ni', 'Oi', 'Pi', 'Qi', 'Ri', 'Si', 'Ti', 'Ui', 'Vi', 'Wi', 'Xi', 'Yi', 'Zi',
            'Aj', 'Bj', 'Cj', 'Dj', 'Ej', 'Fj', 'Gj', 'Hj', 'Ij', 'Jj', 'Kj', 'Lj', 'Mj',
            'Nj', 'Oj', 'Pj', 'Qj', 'Rj', 'Sj', 'Tj', 'Uj', 'Vj', 'Wj', 'Xj', 'Yj', 'Zj',
            'Ak', 'Bk', 'Ck', 'Dk', 'Ek', 'Fk', 'Gk', 'Hk', 'Ik', 'Jk', 'Kk', 'Lk', 'Mk',
            'Nk', 'Ok', 'Pk', 'Qk', 'Rk', 'Sk', 'Tk', 'Uk', 'Vk', 'Wk', 'Xk', 'Yk', 'Zk',
            'Al', 'Bl', 'Cl', 'Dl', 'El', 'Fl', 'Gl', 'Hl', 'Il', 'Jl', 'Kl', 'Ll', 'Ml',
            'Nl', 'Ol', 'Pl', 'Ql', 'Rl', 'Sl', 'Tl', 'Ul', 'Vl', 'Wl', 'Xl', 'Yl', 'Zl',
            'Am', 'Bm', 'Cm', 'Dm', 'Em', 'Fm', 'Gm', 'Hm', 'Im', 'Jm', 'Km', 'Lm', 'Mm',
            'Nm', 'Om', 'Pm', 'Qm', 'Rm', 'Sm', 'Tm', 'Um', 'Vm', 'Wm', 'Xm', 'Ym', 'Zm',
            'An', 'Bn', 'Cn', 'Dn', 'En', 'Fn', 'Gn', 'Hn', 'In', 'Jn', 'Kn', 'Ln', 'Mn',
            'Nn', 'On', 'Pn', 'Qn', 'Rn', 'Sn', 'Tn', 'Un', 'Vn', 'Wn', 'Xn', 'Yn', 'Zn',
            'Ao', 'Bo', 'Co', 'Do', 'Eo', 'Fo', 'Go', 'Ho', 'Io', 'Jo', 'Ko', 'Lo', 'Mo',
            'No', 'Oo', 'Po', 'Qo', 'Ro', 'So', 'To', 'Uo', 'Vo', 'Wo', 'Xo', 'Yo', 'Zo',
            'Ap', 'Bp', 'Cp', 'Dp', 'Ep', 'Fp', 'Gp', 'Hp', 'Ip', 'Jp', 'Kp', 'Lp', 'Mp',
            'Np', 'Op', 'Pp', 'Qp', 'Rp', 'Sp', 'Tp', 'Up', 'Vp', 'Wp', 'Xp', 'Yp', 'Zp',
            'Aq', 'Bq', 'Cq', 'Dq', 'Eq', 'Fq', 'Gq', 'Hq', 'Iq', 'Jq', 'Kq', 'Lq', 'Mq',
            'Nq', 'Oq', 'Pq', 'Qq', 'Rq', 'Sq', 'Tq', 'Uq', 'Vq', 'Wq', 'Xq', 'Yq', 'Zq',
            'Ar', 'Br', 'Cr', 'Dr', 'Er', 'Fr', 'Gr', 'Hr', 'Ir', 'Jr', 'Kr', 'Lr', 'Mr',
            'Nr', 'Or', 'Pr', 'Qr', 'Rr', 'Sr', 'Tr', 'Ur', 'Vr', 'Wr', 'Xr', 'Yr', 'Zr',
            'As', 'Bs', 'Cs', 'Ds', 'Es', 'Fs', 'Gs', 'Hs', 'Is', 'Js', 'Ks', 'Ls', 'Ms',
            'Ns', 'Os', 'Ps', 'Qs', 'Rs', 'Ss', 'Ts', 'Us', 'Vs', 'Ws', 'Xs', 'Ys', 'Zs',
            'At', 'Bt', 'Ct', 'Dt', 'Et', 'Ft', 'Gt', 'Ht', 'It', 'Jt', 'Kt', 'Lt', 'Mt',
            'Nt', 'Ot', 'Pt', 'Qt', 'Rt', 'St', 'Tt', 'Ut', 'Vt', 'Wt', 'Xt', 'Yt', 'Zt',
            'Au', 'Bu', 'Cu', 'Du', 'Eu', 'Fu', 'Gu', 'Hu', 'Iu', 'Ju', 'Ku', 'Lu', 'Mu',
            'Nu', 'Ou', 'Pu', 'Qu', 'Ru', 'Su', 'Tu', 'Uu', 'Vu', 'Wu', 'Xu', 'Yu', 'Zu',
            'Av', 'Bv', 'Cv', 'Dv', 'Ev', 'Fv', 'Gv', 'Hv', 'Iv', 'Jv', 'Kv', 'Lv', 'Mv',
            'Nv', 'Ov', 'Pv', 'Qv', 'Rv', 'Sv', 'Tv', 'Uv', 'Vv', 'Wv', 'Xv', 'Yv', 'Zv',
            'Aw', 'Bw', 'Cw', 'Dw', 'Ew', 'Fw', 'Gw', 'Hw', 'Iw', 'Jw', 'Kw', 'Lw', 'Mw',
            'Nw', 'Ow', 'Pw', 'Qw', 'Rw', 'Sw', 'Tw', 'Uw', 'Vw', 'Ww', 'Xw', 'Yw', 'Zw',
            'Ax', 'Bx', 'Cx', 'Dx', 'Ex', 'Fx', 'Gx', 'Hx', 'Ix', 'Jx', 'Kx', 'Lx', 'Mx',
            'Nx', 'Ox', 'Px', 'Qx', 'Rx', 'Sx', 'Tx', 'Ux', 'Vx', 'Wx', 'Xx', 'Yx', 'Zx',
            'Ay', 'By', 'Cy', 'Dy', 'Ey', 'Fy', 'Gy', 'Hy', 'Iy', 'Jy', 'Ky', 'Ly', 'My',
            'Ny', 'Oy', 'Py', 'Qy', 'Ry', 'Sy', 'Ty', 'Uy', 'Vy', 'Wy', 'Xy', 'Yy', 'Zy',
            'Az', 'Bz', 'Cz', 'Dz', 'Ez', 'Fz', 'Gz', 'Hz', 'Iz', 'Jz', 'Kz', 'Lz', 'Mz',
            'Nz', 'Oz', 'Pz', 'Qz', 'Rz', 'Sz', 'Tz', 'Uz', 'Vz', 'Wz', 'Xz', 'Yz', 'Zz',
        ],
    ];

    // //TODO: temp testing... add some generated (big) ones
    // let aj = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'];
    // let test100 = [] as string[];
    // let test1000 = [] as string[];
    // let test10000 = [] as string[];
    // tests.push(test100);
    // testsThatThrow.push(test1000, test10000);
    // aj.forEach(c1 => {
    //     aj.forEach(c2 => {
    //         test100.push(c1 + c2 + '*');
    //         aj.forEach(c3 => {
    //             test1000.push(c1 + c2 + c3 + '*');
    //             aj.forEach(c4 => {
    //                 test10000.push(c1 + c2 + c3 + c4 + '*');
    //             });
    //         });
    //     });
    // });

    tests.concat(testsThatThrow).forEach((test, i) => {
        let testName = test.join(', ');
        if (testName.length > 60) testName = testName.slice(0, 60) + '...';
        testName = `${test.length} items${i >= tests.length ? ' (too complex)' : ''} (${testName})`;
        it(testName, () => {
            let predicates = test;
            let ed1: EulerDiagram;
            let ed2: EulerDiagram;
            let attempt = () => {
                // Construct an ED from the given predicates in the given order and in reverse order.
                ed1 = new EulerDiagram(predicates, isUnreachable);
                ed2 = new EulerDiagram(predicates.reverse(), isUnreachable);
            };

            let expectedToThrow = i >= tests.length;
            if (expectedToThrow) {
                expect(attempt).to.throw();
            }
            else {
                expect(attempt).not.to.throw();

                // The two EDs should represent identical DAGs.
                expect(setToObj(ed1!.universalSet)).to.deep.equal(setToObj(ed2!.universalSet));
            }
        });
    });
});





/** Helper function that converts an EulerDiagram to a simple nested object with predicate sources for keys */
function setToObj(set: EulerSet): {} {
    return set.subsets.reduce(
        (obj, subset) => {
            let key = subset.predicate as string;
            if (!subset.isPrincipal) key = `[${key}]`;
            obj[key] = setToObj(subset);
            return obj;
        },
        {}
    );
}





// TODO: temp testing...
function isUnreachable(p: NormalPredicate) {

    // Only consider the form *A*B*C*...*
    if (p.length < 3) return;
    if (p.charAt(0) !== '*' || p.charAt(p.length - 1) !== '*') return;
    if (p.indexOf('**') !== -1 || p.indexOf('/') !== -1) return;

    // If the parts aren't strictly ordered, it's unreachable
    let parts = p.slice(1, -1).split('*');
    for (let i = 0, j = 1; j < parts.length; ++i, ++j) {
        if (parts[i] >= parts[j]) return true;
    }
    return;
}
