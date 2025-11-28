import ReactECharts from "echarts-for-react";
import dayjs from "dayjs";

interface NivelData {
  codigo: string;
  ubicacion: string;
  x: number[];
  y: number[];
  umbral_amarillo: number;
  umbral_naranja: number;
  umbral_rojo: number;
  offset: number;
}

interface Props {
  nivel: NivelData;
  currentLevel?: number; // Nivel actual en cm (opcional)
}

export const CurrentLevelChart = ({ nivel, currentLevel }: Props) => {
  // Si no se proporciona nivel actual, usar 50% del offset como ejemplo
  const currentLevelValue = currentLevel ?? Math.round(nivel.offset * 0.5);

  // profileData is the data for the section profile
  const profileData = nivel.x.map((xVal, index) => ({
    x: parseFloat(xVal.toString()),
    y: Number(parseFloat(nivel.y[index].toString()) * 100),
    level: currentLevelValue,
  }));

  const yInterval = nivel.offset / 5;
  const xMax = parseFloat(nivel.x[nivel.x.length - 1].toString());
  const titleOfChart = `${nivel.codigo} - ${nivel.ubicacion} - ${dayjs().format("DD/MM/YYYY HH:mm")}`;

  // ====== Chart Options ======
  const option = {
    title: {
      text: titleOfChart,
    },
    legend: {
      data: [
        "Nivel actual",
        "Nivel seguro",
        "Alerta Amarilla",
        "Alerta Naranja",
        "Alerta Roja",
      ],
      orient: "horizontal",
      top: "bottom",
    },

    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "cross",
        label: {
          backgroundColor: "#6a7985",
          formatter: (params: any) => {
            const { axisDimension, value } = params;
            const numValue =
              typeof value === "number" ? value : parseFloat(value);

            if (isNaN(numValue)) return `${value}`;

            // Y-axis (vertical) shows cm, X-axis (horizontal) shows m
            const unit = axisDimension === "y" ? "cm" : "m";
            return `${numValue.toFixed(0)} ${unit}`;
          },
        },
      },
      // Only show tooltip for line series
      filter: (params: any) =>
        params.some((p: any) => p.seriesType === "line"),
    },

    grid: [
      {
        left: "10%",
        right: "12%",
        top: "10%",
        bottom: "25%",
        containLabel: false,
      },
      {
        left: "86.7%",
        right: "5%",
        top: "10%",
        bottom: "25%",
        containLabel: false,
      },
    ],
    toolbox: {
      feature: {
        saveAsImage: {
          title: "Guardar como .png",
        },
      },
    },
    xAxis: [
      {
        gridIndex: 0,
        type: "value",
        name: " Ancho de la corriente (m)",

        boundaryGap: false,
        nameLocation: "middle",
        nameGap: 25,
        splitLine: { show: true },
        axisLabel: {
          formatter: "{value}",
        },
        max: xMax,
      },
      {
        gridIndex: 1,
        type: "category",
        data: ["Umbrales"],
        splitLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
      },
    ],
    yAxis: [
      {
        gridIndex: 0,
        type: "value",
        name: "Nivel (cm)",
        min: 0,
        max: nivel.offset,
        interval: yInterval,
        nameLocation: "middle",
        nameGap: 35,
        position: "left",
        axisLine: {
          lineStyle: {
            color: "#6a7985",
          },
        },
        axisLabel: {
          formatter: (value: number) => `${Math.round(value)}`,
        },
      },
      {
        gridIndex: 1,
        type: "value",
        min: 0,
        max: nivel.offset,
        interval: yInterval,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { show: false },
        splitLine: { show: false },
      },
    ],
    dataset: {
      source: profileData,
      dimensions: ["x", "y", "level"],
    },
    series: [
      {
        name: "Nivel actual",
        type: "line",
        smooth: false,
        yAxisIndex: 0,
        z: 1,
        emphasis: {
          disabled: true,
          // focus: "series",
          // scale: true,
        },
        encode: {
          x: "x",
          y: "level",
        },
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          color: "transparent",
        },
        areaStyle: {
          color: "#005EB8",
        },
      },
      {
        name: "Linea de nivel actual",
        type: "line",
        smooth: false,
        yAxisIndex: 0,
        z: 3,
        emphasis: {
          disabled: true,
          // focus: "series",
          // scale: true,
        },
        encode: {
          x: "x",
          y: "level",
        },
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          // color: "transparent",
          color: "#005EB8",
          type: "dashed",
          width: 1,
        },

        areaStyle: {
          color: "transparent",
        },
        tooltip: {
          show: false,
        },
        markLine: {
          silent: true,
          symbol: "none",
          label: {
            show: true,
            position: "insideEndTop",
            formatter: `${currentLevelValue} cm`,
            color: "#005EB8",
            fontWeight: "bold",
            fontSize: 16,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            padding: [2, 4],
            borderRadius: 2,
          },
          data: [
            {
              yAxis: currentLevelValue,
              lineStyle: {
                color: "transparent",
              },
            },
          ],
        },
      },
      {
        name: "Sección",
        type: "line",
        smooth: false,
        yAxisIndex: 0,
        z: 2,
        emphasis: {
          disabled: true,
          // scale: true,
        },
        encode: {
          x: "x",
          y: "y",
        },
        showSymbol: false,
        showAllSymbol: false,
        lineStyle: {
          color: "#e9c39e",
        },
        areaStyle: {
          color: "#e9c39e",
          opacity: 1,
        },
        tooltip: {
          show: false,
        },
      },

      {
        name: "Nivel seguro",
        type: "bar",
        stack: "thresholds",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [nivel.offset - nivel.umbral_amarillo],
        itemStyle: { color: "green" },
        tooltip: { show: false },
      },
      {
        name: "Alerta Amarilla",
        type: "bar",
        stack: "thresholds",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [nivel.umbral_amarillo - nivel.umbral_naranja],
        itemStyle: { color: "yellow" },
        tooltip: { show: false },
      },
      {
        name: "Alerta Naranja",
        type: "bar",
        stack: "thresholds",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [nivel.umbral_naranja - nivel.umbral_rojo],
        itemStyle: { color: "orange" },
        tooltip: { show: false },
      },
      {
        name: "Alerta Roja",
        type: "bar",
        stack: "thresholds",
        xAxisIndex: 1,
        yAxisIndex: 1,
        data: [nivel.umbral_rojo],
        itemStyle: { color: "red" },
        tooltip: { show: false },
      },
    ],
  };

  return (
    <div style={{ width: "100%", height: "500px" }}>
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
};
