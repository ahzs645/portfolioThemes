/**
 * Shell types — exact port from baothiento.com source
 * 13 shell shapes with draw() and drawCracked() methods
 */

// e = ctx, t = size, a = crackT
export const SHELL_TYPES = [
      {
        color: "#D4B896",
        accent: "#C0A47C",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, t * 0.4);
          e.quadraticCurveTo(-(t * 0.48), -(t * 0.1), -(t * 0.18), -(t * 0.42));
          e.quadraticCurveTo(0, -(t * 0.52), t * 0.18, -(t * 0.42));
          e.quadraticCurveTo(t * 0.48, -(t * 0.1), 0, t * 0.4);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.6;
          for (let a = -3; a <= 3; a++) {
            e.beginPath();
            e.moveTo(0, t * 0.35);
            e.quadraticCurveTo(
              a * t * 0.08,
              -(t * 0.05),
              a * t * 0.06,
              -(t * 0.38)
            );
            e.stroke();
          }
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.3;
          e.save();
          e.translate(-l, 0);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, t * 0.4);
          e.quadraticCurveTo(-(t * 0.48), -(t * 0.1), -(t * 0.18), -(t * 0.42));
          e.lineTo(0, -(t * 0.2));
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, 0);
          e.rotate(a * 0.2);
          e.fillStyle = this.accent;
          e.beginPath();
          e.moveTo(0, t * 0.4);
          e.quadraticCurveTo(t * 0.48, -(t * 0.1), t * 0.18, -(t * 0.42));
          e.lineTo(0, -(t * 0.2));
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#E0C8A8",
        accent: "#C8B090",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.38, t * 0.28, 0, 0, Math.PI * 2);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.7;
          e.beginPath();
          for (let a = 0; a < Math.PI * 3.5; a += 0.08) {
            let l = t * 0.04 + a * t * 0.028;
            let i = Math.cos(a) * l * 0.65;
            let r = Math.sin(a) * l * 0.42;
            if (a < 0.1) {
              e.moveTo(i, r);
            } else {
              e.lineTo(i, r);
            }
          }
          e.stroke();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.25;
          e.save();
          e.translate(-l, -(l * 0.3));
          e.rotate(-(a * 0.15));
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.38, t * 0.28, 0, Math.PI * 0.5, Math.PI * 1.5);
          e.fill();
          e.restore();
          e.save();
          e.translate(l, l * 0.3);
          e.rotate(a * 0.1);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(
            0,
            0,
            t * 0.38,
            t * 0.28,
            0,
            -(Math.PI * 0.5),
            Math.PI * 0.5
          );
          e.fill();
          e.restore();
        },
      },
      {
        color: "#C8B898",
        accent: "#B0A080",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.35, t * 0.25, 0, 0, Math.PI * 2);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.5;
          e.beginPath();
          e.ellipse(0, t * 0.03, t * 0.25, t * 0.17, 0, 0, Math.PI * 2);
          e.stroke();
          e.beginPath();
          e.ellipse(0, t * 0.06, t * 0.15, t * 0.1, 0, 0, Math.PI * 2);
          e.stroke();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, a * 2);
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.2, t * 0.23, -0.15, 0, Math.PI * 2);
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(a * 1.5));
          e.rotate(a * 0.3);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(0, 0, t * 0.18, t * 0.2, 0.15, 0, Math.PI * 2);
          e.fill();
          e.restore();
        },
      },
      {
        color: "#E8D8C0",
        accent: "#D0C0A8",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.22, t * 0.32, 0, 0, Math.PI * 2);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.9;
          e.beginPath();
          e.moveTo(0, -(t * 0.24));
          e.lineTo(0, t * 0.24);
          e.stroke();
          e.lineWidth = 0.4;
          for (let a = -3; a <= 3; a++) {
            let l = a * t * 0.06;
            e.beginPath();
            e.moveTo(-(t * 0.04), l);
            e.lineTo(t * 0.04, l);
            e.stroke();
          }
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, 0);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.13, t * 0.3, -0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
          e.save();
          e.translate(l, 0);
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(0, 0, t * 0.11, t * 0.24, 0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
        },
      },
      {
        color: "#DCC0A0",
        accent: "#C4A880",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(-(t * 0.15), t * 0.35);
          e.quadraticCurveTo(-(t * 0.4), t * 0.1, -(t * 0.28), -(t * 0.15));
          e.quadraticCurveTo(-(t * 0.1), -(t * 0.45), t * 0.1, -(t * 0.38));
          e.quadraticCurveTo(t * 0.35, -(t * 0.2), t * 0.2, t * 0.15);
          e.quadraticCurveTo(t * 0.05, t * 0.4, -(t * 0.15), t * 0.35);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.5;
          e.beginPath();
          e.arc(0, 0, t * 0.15, Math.PI * 0.3, Math.PI * 1.5);
          e.stroke();
          e.beginPath();
          e.arc(0, -(t * 0.05), t * 0.08, Math.PI * 0.2, Math.PI * 1.4);
          e.stroke();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.25;
          e.save();
          e.translate(-l, l * 0.2);
          e.rotate(-(a * 0.15));
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(
            -(t * 0.05),
            0,
            t * 0.18,
            t * 0.3,
            -0.2,
            Math.PI * 0.5,
            Math.PI * 1.5
          );
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(l * 0.15));
          e.rotate(a * 0.2);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(
            t * 0.05,
            0,
            t * 0.15,
            t * 0.25,
            0.1,
            -(Math.PI * 0.5),
            Math.PI * 0.5
          );
          e.fill();
          e.restore();
        },
      },
      {
        color: "#C0B498",
        accent: "#A89C80",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, t * 0.05, t * 0.28, t * 0.2, 0, 0, Math.PI * 2);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.4;
          for (let a = 0; a < Math.PI * 2; a += Math.PI / 5) {
            e.beginPath();
            e.moveTo(Math.cos(a) * t * 0.06, t * 0.05 + Math.sin(a) * t * 0.04);
            e.lineTo(Math.cos(a) * t * 0.25, t * 0.05 + Math.sin(a) * t * 0.18);
            e.stroke();
          }
          e.fillStyle = "rgba(255,255,255,0.12)";
          e.beginPath();
          e.arc(0, t * 0.02, t * 0.07, 0, Math.PI * 2);
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, a);
          e.rotate(-(a * 0.25));
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.16, t * 0.18, -0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(a * 0.5));
          e.rotate(a * 0.2);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(0, 0, t * 0.14, t * 0.15, 0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
        },
      },
      {
        color: "#D4A07A",
        accent: "#C08860",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          for (let a = 0; a < 5; a++) {
            let l = (a / 5) * Math.PI * 2 - Math.PI / 2;
            let i = l + Math.PI / 5;
            let r = Math.cos(l) * t * 0.4;
            let n = Math.sin(l) * t * 0.4;
            let o = Math.cos(i) * t * 0.14;
            let s = Math.sin(i) * t * 0.14;
            if (a === 0) {
              e.moveTo(r, n);
            } else {
              e.lineTo(r, n);
            }
            e.lineTo(o, s);
          }
          e.closePath();
          e.fill();
          e.fillStyle = this.accent;
          e.beginPath();
          e.arc(0, 0, t * 0.08, 0, Math.PI * 2);
          e.fill();
          e.fillStyle = "rgba(255,255,255,0.15)";
          for (let a = 0; a < 5; a++) {
            let l = (a / 5) * Math.PI * 2 - Math.PI / 2;
            e.beginPath();
            e.arc(
              Math.cos(l) * t * 0.22,
              Math.sin(l) * t * 0.22,
              t * 0.03,
              0,
              Math.PI * 2
            );
            e.fill();
          }
        },
        drawCracked(e, t, a) {
          e.save();
          e.translate(a * t * 0.3, -a * t * 0.2);
          e.rotate(a * 0.5);
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.38));
          e.lineTo(-(t * 0.08), -(t * 0.08));
          e.lineTo(t * 0.08, -(t * 0.08));
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(-a * t * 0.05, a * t * 0.03);
          e.rotate(-(a * 0.1));
          e.fillStyle = this.accent;
          e.beginPath();
          for (let a = 1; a < 5; a++) {
            let l = (a / 5) * Math.PI * 2 - Math.PI / 2;
            let i = l + Math.PI / 5;
            let r = Math.cos(l) * t * 0.38;
            let n = Math.sin(l) * t * 0.38;
            let o = Math.cos(i) * t * 0.13;
            let s = Math.sin(i) * t * 0.13;
            if (a === 1) {
              e.moveTo(r, n);
            } else {
              e.lineTo(r, n);
            }
            e.lineTo(o, s);
          }
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#D8CCBA",
        accent: "#BFB3A0",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.arc(0, 0, t * 0.34, 0, Math.PI * 2);
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.8;
          for (let a = 0; a < 5; a++) {
            let l = (a / 5) * Math.PI * 2 - Math.PI / 2;
            e.beginPath();
            e.ellipse(
              Math.cos(l) * t * 0.12,
              Math.sin(l) * t * 0.12,
              t * 0.06,
              t * 0.16,
              l,
              0,
              Math.PI * 2
            );
            e.stroke();
          }
          e.fillStyle = this.accent;
          e.beginPath();
          e.arc(0, 0, t * 0.04, 0, Math.PI * 2);
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.22;
          e.save();
          e.translate(-l, l * 0.2);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.arc(0, 0, t * 0.32, Math.PI * 0.6, Math.PI * 1.6);
          e.lineTo(0, 0);
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(l * 0.15));
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.arc(0, 0, t * 0.3, -(Math.PI * 0.4), Math.PI * 0.6);
          e.lineTo(0, 0);
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#5A6672",
        accent: "#4A5560",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.42));
          e.bezierCurveTo(
            -(t * 0.32),
            -(t * 0.15),
            -(t * 0.28),
            t * 0.2,
            0,
            t * 0.35
          );
          e.bezierCurveTo(
            t * 0.28,
            t * 0.2,
            t * 0.32,
            -(t * 0.15),
            0,
            -(t * 0.42)
          );
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.5;
          for (let a = 1; a <= 4; a++) {
            let l = -(t * 0.42) + a * t * 0.16;
            let i = t * 0.15 + a * t * 0.04;
            e.beginPath();
            e.ellipse(0, l, i, t * 0.04, 0, 0, Math.PI);
            e.stroke();
          }
          e.fillStyle = "rgba(120,140,180,0.12)";
          e.beginPath();
          e.ellipse(
            -(t * 0.05),
            t * 0.05,
            t * 0.12,
            t * 0.2,
            -0.2,
            0,
            Math.PI * 2
          );
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, a * 2);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.4));
          e.bezierCurveTo(
            -(t * 0.3),
            -(t * 0.1),
            -(t * 0.25),
            t * 0.15,
            0,
            t * 0.1
          );
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -a);
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.moveTo(0, -(t * 0.35));
          e.bezierCurveTo(t * 0.28, -(t * 0.1), t * 0.22, t * 0.18, 0, t * 0.3);
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#CCBA9E",
        accent: "#B8A688",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.45));
          e.quadraticCurveTo(-(t * 0.06), -(t * 0.3), -(t * 0.12), -(t * 0.1));
          e.quadraticCurveTo(-(t * 0.18), t * 0.15, -(t * 0.14), t * 0.35);
          e.quadraticCurveTo(0, t * 0.45, t * 0.14, t * 0.35);
          e.quadraticCurveTo(t * 0.18, t * 0.15, t * 0.12, -(t * 0.1));
          e.quadraticCurveTo(t * 0.06, -(t * 0.3), 0, -(t * 0.45));
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.6;
          for (let a = 0; a < 6; a++) {
            let l = -(t * 0.35) + a * t * 0.13;
            let i = t * 0.05 + a * t * 0.02;
            e.beginPath();
            e.moveTo(-i, l);
            e.lineTo(i, l);
            e.stroke();
          }
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.18;
          e.save();
          e.translate(-(l * 0.5), -a * t * 0.15);
          e.rotate(-(a * 0.3));
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.43));
          e.quadraticCurveTo(-(t * 0.06), -(t * 0.28), -(t * 0.1), -(t * 0.05));
          e.lineTo(t * 0.1, -(t * 0.05));
          e.quadraticCurveTo(t * 0.06, -(t * 0.28), 0, -(t * 0.43));
          e.fill();
          e.restore();
          e.save();
          e.translate(l * 0.3, a * t * 0.05);
          e.rotate(a * 0.1);
          e.fillStyle = this.accent;
          e.beginPath();
          e.moveTo(-(t * 0.12), -(t * 0.05));
          e.quadraticCurveTo(-(t * 0.17), t * 0.15, -(t * 0.13), t * 0.33);
          e.quadraticCurveTo(0, t * 0.43, t * 0.13, t * 0.33);
          e.quadraticCurveTo(t * 0.17, t * 0.15, t * 0.12, -(t * 0.05));
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#C8A878",
        accent: "#B09468",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.48));
          e.bezierCurveTo(
            -(t * 0.08),
            -(t * 0.35),
            -(t * 0.2),
            -(t * 0.12),
            -(t * 0.22),
            t * 0.1
          );
          e.bezierCurveTo(
            -(t * 0.24),
            t * 0.28,
            -(t * 0.12),
            t * 0.42,
            t * 0.04,
            t * 0.42
          );
          e.bezierCurveTo(
            t * 0.18,
            t * 0.42,
            t * 0.28,
            t * 0.22,
            t * 0.22,
            t * 0.05
          );
          e.bezierCurveTo(
            t * 0.18,
            -(t * 0.15),
            t * 0.1,
            -(t * 0.32),
            0,
            -(t * 0.48)
          );
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.7;
          for (let a = 0; a < 5; a++) {
            let l = -(t * 0.3) + a * t * 0.15;
            let i = t * 0.08 + a * t * 0.03;
            e.beginPath();
            e.moveTo(-(t * 0.18) + a * t * 0.01, l);
            e.quadraticCurveTo(0, l - i, t * 0.16 - a * t * 0.01, l);
            e.stroke();
          }
          e.fillStyle = "rgba(255,240,220,0.15)";
          e.beginPath();
          e.ellipse(
            t * 0.02,
            t * 0.18,
            t * 0.08,
            t * 0.16,
            0.2,
            0,
            Math.PI * 2
          );
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, -a * t * 0.1);
          e.rotate(-(a * 0.25));
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.46));
          e.bezierCurveTo(
            -(t * 0.08),
            -(t * 0.3),
            -(t * 0.2),
            -(t * 0.1),
            -(t * 0.2),
            t * 0.1
          );
          e.lineTo(0, t * 0.05);
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, a * t * 0.08);
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.moveTo(0, -(t * 0.2));
          e.bezierCurveTo(
            t * 0.22,
            t * 0,
            t * 0.18,
            t * 0.35,
            t * 0.02,
            t * 0.4
          );
          e.lineTo(-(t * 0.05), t * 0.1);
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#D8B898",
        accent: "#C4A480",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.35));
          e.bezierCurveTo(
            -(t * 0.42),
            -(t * 0.35),
            -(t * 0.42),
            t * 0.15,
            0,
            t * 0.38
          );
          e.bezierCurveTo(
            t * 0.42,
            t * 0.15,
            t * 0.42,
            -(t * 0.35),
            0,
            -(t * 0.35)
          );
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.8;
          for (let a = -4; a <= 4; a++) {
            let l = (a / 6) * 0.8;
            e.beginPath();
            e.moveTo(0, -(t * 0.3));
            let i = Math.sin(l) * t * 0.38;
            let r = t * 0.32;
            e.quadraticCurveTo(i * 0.5, r * 0.4, i, r);
            e.stroke();
          }
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.22;
          e.save();
          e.translate(-l, a * 2);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.moveTo(0, -(t * 0.33));
          e.bezierCurveTo(
            -(t * 0.4),
            -(t * 0.33),
            -(t * 0.4),
            t * 0.12,
            0,
            t * 0.15
          );
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -a);
          e.rotate(a * 0.18);
          e.fillStyle = this.accent;
          e.beginPath();
          e.moveTo(0, -(t * 0.33));
          e.bezierCurveTo(t * 0.4, -(t * 0.33), t * 0.4, t * 0.12, 0, t * 0.35);
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#A8B0A0",
        accent: "#8E9688",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.arc(0, t * 0.04, t * 0.3, 0, Math.PI * 2);
          e.fill();
          e.beginPath();
          e.moveTo(-(t * 0.12), -(t * 0.15));
          e.quadraticCurveTo(0, -(t * 0.42), t * 0.1, -(t * 0.18));
          e.quadraticCurveTo(t * 0.05, -(t * 0.1), -(t * 0.12), -(t * 0.15));
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.6;
          e.beginPath();
          for (let a = 0; a < Math.PI * 4; a += 0.1) {
            let l = t * 0.04 + a * t * 0.02;
            let i = Math.cos(a) * l;
            let r = t * 0.04 + Math.sin(a) * l * 0.7;
            if (a < 0.1) {
              e.moveTo(i, r);
            } else {
              e.lineTo(i, r);
            }
          }
          e.stroke();
          e.fillStyle = "rgba(200,220,210,0.15)";
          e.beginPath();
          e.ellipse(
            t * 0.06,
            t * 0.06,
            t * 0.14,
            t * 0.18,
            0.3,
            0,
            Math.PI * 2
          );
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.2;
          e.save();
          e.translate(-l, l * 0.3);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.arc(0, 0, t * 0.28, Math.PI * 0.5, Math.PI * 1.5);
          e.lineTo(0, 0);
          e.closePath();
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(l * 0.2));
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.arc(0, 0, t * 0.25, -(Math.PI * 0.5), Math.PI * 0.5);
          e.lineTo(0, 0);
          e.closePath();
          e.fill();
          e.restore();
        },
      },
      {
        color: "#B0A898",
        accent: "#989080",
        draw(e, t) {
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.24, t * 0.28, 0, 0, Math.PI * 2);
          e.fill();
          e.beginPath();
          e.moveTo(-(t * 0.06), -(t * 0.22));
          e.quadraticCurveTo(0, -(t * 0.38), t * 0.05, -(t * 0.24));
          e.fill();
          e.strokeStyle = this.accent;
          e.lineWidth = 0.5;
          for (let a = 0; a < 4; a++) {
            let l = -(t * 0.15) + a * t * 0.1;
            e.beginPath();
            e.ellipse(
              0,
              l,
              t * 0.2 + a * t * 0.01,
              t * 0.03,
              -0.15,
              0,
              Math.PI
            );
            e.stroke();
          }
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(
            t * 0.04,
            t * 0.08,
            t * 0.08,
            t * 0.12,
            0.2,
            0,
            Math.PI * 2
          );
          e.fill();
        },
        drawCracked(e, t, a) {
          let l = a * t * 0.18;
          e.save();
          e.translate(-l, a);
          e.rotate(-(a * 0.2));
          e.fillStyle = this.color;
          e.beginPath();
          e.ellipse(0, 0, t * 0.14, t * 0.26, -0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
          e.save();
          e.translate(l, -(a * 0.5));
          e.rotate(a * 0.15);
          e.fillStyle = this.accent;
          e.beginPath();
          e.ellipse(0, 0, t * 0.12, t * 0.2, 0.1, 0, Math.PI * 2);
          e.fill();
          e.restore();
        },
      },
];
