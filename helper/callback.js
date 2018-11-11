
var cnt = 0;
module.exports = {
    increment: function () { cnt++; },
    decrement: function () 
    {
        cnt--;
        if(cnt == 0)
            return true;
        else
            return false;
    }
}

