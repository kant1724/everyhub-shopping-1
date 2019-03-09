let datepickerOption = {
    monthsFull: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    monthsShort: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    weekdaysFull: ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'],
    weekdaysShort: ['일', '월', '화', '수', '목', '금', '토'],
    showMonthsShort: undefined,
    showWeekdaysFull: undefined,

    today: '오늘',
    clear: '초기화',
    close: '닫기',

    labelMonthNext: '다음달',
    labelMonthPrev: '이전달',
    labelMonthSelect: '월을 선택하세요.',
    labelYearSelect: '년을 선택하세요.',

    format: 'yyyy-mm-dd',
    formatSubmit: 'yyyy-mm-dd'
};

let datepicker = {
    init: function() {
        $('.datepicker').pickadate(datepickerOption);
        let from_input = $('#startingDate').pickadate();
        let from_picker = from_input.pickadate('picker');
        let to_input = $('#endingDate').pickadate();
        let to_picker = to_input.pickadate('picker');
        if (from_picker.get('value')) {
            to_picker.set('min', from_picker.get('select'))
        }
        if (to_picker.get('value')) {
            from_picker.set('max', to_picker.get('select'))
        }
        from_picker.on('set', function (event) {
            if (event.select) {
                to_picker.set('min', from_picker.get('select'))
            } else if ('clear' in event) {
                to_picker.set('min', false)
            }
        });
        to_picker.on('set', function (event) {
            if (event.select) {
                from_picker.set('max', to_picker.get('select'))
            } else if ('clear' in event) {
                from_picker.set('max', false)
            }
        });
        $('#startingDate').val('2019-03-01');
        $('#endingDate').val('2019-04-01');
    }
};