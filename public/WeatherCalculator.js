function calculateWindDirection(degrees) {
    if (degrees >= 348.75 || degrees < 11.25) {
        return "Nord";
    } else if (degrees >= 11.25 && degrees < 33.75) {
        return "Nord Nordost";
    } else if (degrees >= 33.75 && degrees < 56.25) {
        return "Nordost";
    } else if (degrees >= 56.25 && degrees < 78.75) {
        return "Ost Nordost";
    } else if (degrees >= 78.75 && degrees < 101.25) {
        return "Ost";
    } else if (degrees >= 101.25 && degrees < 123.75) {
        return "Ost Südost";
    } else if (degrees >= 123.75 && degrees < 146.25) {
        return "Südost";
    } else if (degrees >= 146.25 && degrees < 168.75) {
        return "Süd Südost";
    } else if (degrees >= 168.75 && degrees < 191.25) {
        return "Süd";
    } else if (degrees >= 191.25 && degrees < 213.75) {
        return "Süd Südwest";
    } else if (degrees >= 213.75 && degrees < 236.25) {
        return "Südwest";
    } else if (degrees >= 236.25 && degrees < 258.75) {
        return "West Südwest";
    } else if (degrees >= 258.75 && degrees < 281.25) {
        return "West";
    } else if (degrees >= 281.25 && degrees < 303.75) {
        return "West Nordwest";
    } else if (degrees >= 303.75 && degrees < 326.25) {
        return "Nordwest";
    } else if (degrees >= 326.25 && degrees < 348.75) {
        return "Nord Nordwest";
    }
}

function calculateTemperatureTrend(readingsArray) {
    if (readingsArray.length === 1) {
        return;
    }
    if (parseFloat(readingsArray[0].temperatur) > parseFloat(readingsArray[1].temperatur)) {
        return 1;
    }
    else if (parseFloat(readingsArray[0].temperatur) < parseFloat(readingsArray[1].temperatur)) {
        return 0;
    }
}

function calculateWindspeedTrend(readingsArray) {
    if (readingsArray.length === 1) {
        return;
    }
    if (parseFloat(readingsArray[0].wind) > parseFloat(readingsArray[1].wind)) {
        return 1;
    }
    else if (parseFloat(readingsArray[0].wind) < parseFloat(readingsArray[1].wind)) {
        return 0;
    }
}

function calculatePressureTrend(readingsArray) {
    if (readingsArray.length === 1) {
        return;
    }
    if (readingsArray[0].luftdruck > readingsArray[1].luftdruck) {
        return 1;
    }
    else if (readingsArray[0].luftdruck < readingsArray[1].luftdruck) {
        return 0;
    }
}

function calculateTempMin(readingsArray) {
    var temp_min = parseFloat(readingsArray[0].temperatur);
    for (var i = 0; i < readingsArray.length; i++) {
        if (parseFloat(readingsArray[i].temperatur) < temp_min) {
            temp_min = readingsArray[i].temperatur;
        }
    }
    return temp_min;
}

function calculateTempMax(readingsArray) {
    var temp_max = parseFloat(readingsArray[0].temperatur);
    for (var i = 0; i < readingsArray.length; i++) {
        if (parseFloat(readingsArray[i].temperatur) > temp_max) {
            temp_max = readingsArray[i].temperatur;
        }
    }
    return temp_max;
}

function calculateWindspeedMin(readingsArray) {
    var wind_min = parseFloat(readingsArray[0].wind);
    for (var i = 0; i < readingsArray.length; i++) {
        if (parseFloat(readingsArray[i].wind) < wind_min) {
            wind_min = readingsArray[i].wind;
        }
    }
    return wind_min;
}

function calculateWindspeedMax(readingsArray) {
    var wind_max = parseFloat(readingsArray[0].wind);
    for (var i = 0; i < readingsArray.length; i++) {
        if (parseFloat(readingsArray[i].wind) > wind_max) {
            wind_max = readingsArray[i].wind;
        }
    }
    return wind_max;
}

function calculatePressureMin(readingsArray) {
    var luftdruck_min = readingsArray[0].luftdruck;
    for (var i = 0; i < readingsArray.length; i++) {
        if (readingsArray[i].luftdruck < luftdruck_min) {
            luftdruck_min = readingsArray[i].luftdruck;
        }
    }
    return luftdruck_min;
}

function calculatePressureMax(readingsArray) {
    var luftdruck_max = readingsArray[0].luftdruck;
    for (var i = 0; i < readingsArray.length; i++) {
        if (readingsArray[i].luftdruck > luftdruck_max) {
            luftdruck_max = readingsArray[i].luftdruck;
        }
    }
    return luftdruck_max;
}

const exportedFunctions = {
    calculateWindDirection,
    calculateTemperatureTrend,
    calculateWindspeedTrend,
    calculatePressureTrend,
    calculateTempMin,
    calculateTempMax,
    calculateWindspeedMin,
    calculateWindspeedMax,
    calculatePressureMin,
    calculatePressureMax
};

module.exports = { exportedFunctions };

